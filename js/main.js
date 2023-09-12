const base_url = "https://api.raindroprdp.com"
const access_token = 'DBYaHWq4qdZDAVIFF44pQ'

var public_ip;
var activeItem = 0;
let index = 0;
let rainDropChart;
function numberWithCommas(x) {
  try {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } catch (error) {
    return "no data";
  }
}

$.get("https://api64.ipify.org?format=json", function (data) {
  public_ip = data.ip;
});
function timeConverter(UNIX_timestamp) {
  // var a = new Date(UNIX_timestamp * 1000);
  var a = new Date(UNIX_timestamp);
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  // var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  var time = date + " " + month + " " + year;
  return time;
}

// alert(content['user_count']);

const currency = "$";
const debug = false;
let content, userInfo;

let raindropsarrays = [];
function findAndAssignData(item_id) {
  const foundItem = raindropsarrays.find(item => item.item_id === item_id);

  document.getElementById('email').textContent = foundItem.user;
  document.getElementById('specs').textContent = foundItem.cpu_cores + 'Cores ' + foundItem.RAM + 'GB';
  document.getElementById('disk_utilization').textContent = foundItem.disk_utilization + '%';
  document.getElementById('os_type').textContent = foundItem.os_type;
  document.getElementById('raindrop_type').textContent = foundItem.raindrop_type;
  document.getElementById('last_connected').textContent = new Date(foundItem.last_connected * 1000).toDateString();
  document.getElementById('last_location').textContent = foundItem.last_location;
  activeItem = item_id;
  getraindropChart(userInfo.account_id);
}

function getraindropChart(account_id) {
  $.ajax({
    url: base_url + "/listings",
    type: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
    },
    contentType: 'application/json',
    data: JSON.stringify({
      "query": "getraindrop",
      "account_id": account_id,
      "item_id": activeItem
    }),
    success: function (response) {
      console.log(content["pricing"]);
      // effected start 1
      let activePrice = findActivePrice(response.type_id);
      upgradeSelect(response.type_id, activePrice);
      //effected end 1
      console.log(response);
      updateChart(response);
      rainDropChart = response;
    },
    error: function (error) {
      console.log(error);
    }
  });
}



function updateChart(content, maxDays = 30) {

  let create_series = [
    {
      data: [],
      type: "line",
      smooth: true,
      areaStyle: {},
      name: "Connections",
    },
    {
      data: [],
      type: "line",
      smooth: true,
      areaStyle: {},
      name: "Upgrades",
    },
    {
      data: [],
      type: "line",
      smooth: true,
      areaStyle: {},
      name: "Reboots",
    },
  ];

  var myChart = echarts.init(document.getElementById("chart-container-modal"), {
    renderer: "svg",
    useDirtyRect: false,
  });

  var option = {
    darkMode: true,
    darkMode: "auto",
    title: {
      text: "Activity",
      textStyle: {
        color: "#b3b9e2",
      },
    },
    legend: {
      orient: "horizontal",
      align: "right",
      verticalAlign: "top",
      y: 10,
      padding: 3,
      itemMarginTop: 5,
      itemMarginBottom: 5,
      itemStyle: {
        lineHeight: "1px",
      },
      textStyle: {
        color: "#b3b9e2",
      },
    },
    color: [
      'rgba(94, 135, 247, 0.7)',
      'rgba(27, 255, 225, 0.7)',
      'rgba(246, 137, 42, 0.7)',
    ],
    grid: {
      top: "15%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}",
      },
      splitLine: { show: false },
    },
    series: create_series,
  };
  console.log(content)
  if (content.activity.length > 0 || content.activity.connections) {
    if (content.activity.connections.length > 0) {
      let i = 0;
      content.activity.connections.forEach((element) => {
        if (i <= maxDays) {
          create_series[0]["data"].unshift(element);
        }
        i++;
      });
    }
    if (content.activity.upgrades.length > 0) {
      i = 0;
      content.activity.upgrades.forEach((element) => {
        if (i <= maxDays) {
          create_series[1]["data"].unshift(element);
        }
        i++;
      });
    }
    if (content.activity.reboots.length > 0) {
      i = 0;
      content.activity.reboots.forEach((element) => {
        if (i <= maxDays) {
          create_series[2]["data"].unshift(element);
        }
        i++;
      });
    }
  }

  myChart.setOption(option);

}

// effected start 2
function upgradePrice() {
  const selectedOption = $(".specs2-select").find('option:selected[data-price]');
  if (selectedOption.length) {
    const price = parseInt(selectedOption.data('upprice'));

    $("#monthly_upgrade_change").text(`${currency}${price}`);
  }
}


function findOsIndex(type_id) {
  for (const osIndex in content["pricing"]) {
    const osArray = content["pricing"][osIndex];
    if (Array.isArray(osArray)) {
      const foundOs = osArray.find(os => os.type_id == type_id);
      if (foundOs) {
        return osIndex;
      }
    }
  }
  return null; // Return null if no match is found
}

function findActivePrice(type_id) {
  for (const osArray of Object.values(content["pricing"])) {
    if (Array.isArray(osArray)) {
      const foundOs = osArray.find(os => os.type_id === type_id);
      if (foundOs) {
        return foundOs.price;
      }
    }
  }
  return null; // Return null if no match is found or array is not found
}

function upgradeSelect(type_id, activePrice) {
  const os = findOsIndex(type_id);
  console.log("This is Item_Id: " + activeItem);
  let lowestUpPrice = Infinity;
  let selectedOption = null;

  const options = content["pricing"][os].map(value => {
    const up = value["price"] - activePrice;

    if (up > 0 && up < lowestUpPrice) {
      lowestUpPrice = up;
      selectedOption = value["type"];
    }

    return `<option value="${value["type"]}" data-itemid="${activeItem}" data-typeid="${type_id}" data-price="${value["price"]}" data-upprice="${up}">(${value["type"]}) CPU: ${value["cpu"]}, RAM: ${value["ram"]} | Monthly Change: $${up}</option>`;
  }).join('');

  $(".specs2-select").html(options);

  if (selectedOption) {
    $(".specs2-select").val(selectedOption);
  }

  upgradePrice();
}

// effected End 2
$(document).ready(function () {
  // $('body').css('opacity', '0.33');
  function removeCompany(itemId, public_ip) {
    // $("#delete_company_button").click(function(event) {
    Swal.fire({
      title: 'Removing Company',
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading()
      },
    });

    event.preventDefault(); // Prevent the default link behavior  
    // Prepare the payload
    let delete_building_data = {
      query: "removecompany",
      company_id: itemId,
      ip: public_ip,
      email: userInfo["email"],
      account_id: userInfo["account_id"]
    };
    console.log(delete_building_data)

    $.ajax({
      url: base_url + "/management",
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
      contentType: 'application/json',
      data: JSON.stringify(delete_building_data),
      success: function (response) {

        Swal.fire({
          title: 'Done',
          text: "Company Removed Successfully.",
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
          didClose: () => {
            Swal.hideLoading();
            window.location.reload(true);
          }
        });
        // Handle the success response here
      },
      error: function (error) {
        Swal.fire({
          title: 'Error',
          text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    });
  }
  function removeRole() {
    Swal.fire({
      title: 'Removing Role',
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading()
      },
    });
    event.preventDefault(); // Prevent the default link behavior
    const itemId = activeItem;

    // Prepare the payload
    let delete_role_data = {
      query: "removerole",
      item_id: itemId
    };

    console.log(delete_role_data)

    $.ajax({
      url: base_url + "/management",
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
      contentType: 'application/json',
      data: JSON.stringify(delete_role_data),
      success: function (response) {

        Swal.fire({
          title: 'Done',
          text: "Role Removed Successfully.",
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
          didClose: () => {
            Swal.hideLoading();
            window.location.reload(true);
          }
        });
        // Handle the success response here
      },
      error: function (error) {
        Swal.fire({
          title: 'Error',
          text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    });
  }


  // // --------------------------
  // //    Remove Team
  // // -------------------------

  // function removeTeam(public_ip) {
  //   Swal.fire({
  //     title: 'Removing Team',
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading()
  //     },
  //   });
  //   event.preventDefault(); // Prevent the default link behavior
  //   const itemId = activeItem;

  //   // Prepare the payload
  //   let delete_team_data = {
  //     query: "removeteam",
  //     team_id: itemId,
  //     ip: public_ip,
  //     email: userInfo["email"],
  //     account_id: userInfo["account_id"]
  //   };

  //   $.ajax({
  //     url: base_url + "/management",
  //     type: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${access_token}`,
  //     },
  //     contentType: 'application/json',
  //     data: JSON.stringify(delete_team_data),
  //     success: function(response) {

  //       Swal.fire({
  //         title: 'Done',
  //         text: "Team Removed Successfully.",
  //         icon: 'success',
  //         timer: 3000,
  //         showConfirmButton: false,
  //         willOpen: () => {
  //           Swal.showLoading()
  //         },
  //         didClose: () => {
  //           Swal.hideLoading();
  //           window.location.reload(true);
  //         }
  //       });
  //       // Handle the success response here
  //     },
  //     error: function(error) {
  //       Swal.fire({
  //         title: 'Error',
  //         text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
  //         icon: 'error',
  //         confirmButtonText: 'Ok',
  //       });
  //     }
  //   });
  // }

  // --------------------------
  //    Remove Department
  // -------------------------

  function removeDepartment(public_ip) {
    Swal.fire({
      title: 'Removing Department',
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading()
      },
    });
    event.preventDefault(); // Prevent the default link behavior
    const itemId = activeItem;

    // Prepare the payload
    let delete_department_data = {
      query: "removedepartment",
      department_id: itemId,
      ip: public_ip,
      email: userInfo["email"],
      account_id: userInfo["account_id"]
    };

    $.ajax({
      url: base_url + "/management",
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
      contentType: 'application/json',
      data: JSON.stringify(delete_department_data),
      success: function (response) {

        Swal.fire({
          title: 'Done',
          text: "Department Removed Successfully.",
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
          didClose: () => {
            Swal.hideLoading();
            window.location.reload(true);
          }
        });
        // Handle the success response here
      },
      error: function (error) {
        Swal.fire({
          title: 'Error',
          text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    });
  }

  // --------------------------
  //    Remove Building
  // -------------------------

  function removeBuilding(public_ip) {
    Swal.fire({
      title: 'Removing Building',
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading()
      },
    });
    event.preventDefault(); // Prevent the default link behavior
    const itemId = activeItem;

    // Prepare the payload
    let delete_building_data = {
      query: "removebuilding",
      building_id: itemId,
      ip: public_ip,
      email: userInfo["email"],
      account_id: userInfo["account_id"]
    };

    $.ajax({
      url: base_url + "/management",
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
      contentType: 'application/json',
      data: JSON.stringify(delete_building_data),
      success: function (response) {

        Swal.fire({
          title: 'Done',
          text: "Building Removed Successfully.",
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
          didClose: () => {
            Swal.hideLoading();
            window.location.reload(true);
          }
        });
        // Handle the success response here
      },
      error: function (error) {
        Swal.fire({
          title: 'Error',
          text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    });
  }


  $.ajax({
    url: base_url + "/listings",
    type: "POST",
    dataType: "text",
    data: '{"query":"getuser","email":"test04@raindroprdp.com"}',
  }).done(function (response) {
    userInfo = JSON.parse(response);
    // getInvoices(userInfo.account_id);
    // userInfo.level = 'department'
    // console.log(userInfo.level);
    console.log(userInfo.level);


    $("#user_name").text(userInfo["first_name"] + " " + userInfo["last_name"]);
    //data for profile modal
    $("#profile_first_name").val(userInfo["first_name"]);
    $("#profile_last_name").val(userInfo["last_name"]);
    $("#profile_email").val(userInfo["email"]);

    $("#profile_pils_admin_level").text(userInfo["level"]);
    $("#profile_pils_item_name").text(userInfo["item_name"]);

    $.ajax({
      url: base_url + "/listings",
      type: "POST",
      dataType: "text",
      data: '{"query":"getview","item_id":"' + userInfo["item_id"] + '"}',
    }).done(function (response) {
      $("body").css("opacity", "1");
      content = JSON.parse(response);
      console.log(content);

      if (content && Object.keys(content.items).length === 0) {
        let modalToOpen = '';
        let itemTitle = '';
        let itemType = '';
        switch (userInfo.level.toLowerCase()) {
          case 'account':
            modalToOpen = '#addcompanyModal';
            itemType = 'company';
            itemTitle = 'Companies';
            break;
          case 'company':
            modalToOpen = '#addbuildingModal';
            itemTitle = 'Buildings';
            itemType = 'building'
            break;
          case 'building':
            modalToOpen = '#adddepartmentModal';
            itemTitle = 'Departments';
            itemType = 'department'
            break;
          case 'department':
            modalToOpen = '#addteamModal';
            itemTitle = 'Teams';
            itemType = 'team'
            break;
          case 'team':
            modalToOpen = '#exampleModal'; //raindrop
            itemTitle = 'Raindrop';
            itemType = 'raindrop'

            break;
          default:
            // Handle any other levels or scenarios as needed
            break;
        }

        Swal.fire({
          title: `No ${itemTitle} Present`,
          text: `You currently don't have any ${itemTitle.toLowerCase()} to build upon, please add a ${itemType} to start using RainDrop`,
          icon: 'warning',
          showCancelButton: true, // Display the "Cancel" button
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Ok',
        }).then((result) => {
          if (result.isConfirmed) {
            $(modalToOpen).modal('show');
          }
        });

      }
      if (userInfo.level == 'Company' || userInfo.level == 'company') {
        $('.company1').hide();
        $('.company2').hide();
        $('.company3').hide();

        $('.raindropsbox').removeClass('col-xl-2');
        $('.raindropsbox').addClass('col-xl-3');

        $('.pendingupgradesbox').removeClass('col-xl-2');
        $('.pendingupgradesbox').addClass('col-xl-3');

        $('.buildingsbox').removeClass('col-lg-3');
        $('.buildingsbox').addClass('col-lg-12');

        $('.buildingsbox').removeClass('col-md-4');
        $('.buildingsbox').addClass('col-md-6');

        $('.departmentsbox').removeClass('col-md-4');
        $('.departmentsbox').addClass('col-md-6');


      }
      if (userInfo.level == 'Building' || userInfo.level == 'building') {
        $("#invite_admin_1 option[value='company']").remove();
        $('.raindropsbox').removeClass('col-xl-2');
        $('.raindropsbox').addClass('col-xl-3');

        $('.pendingupgradesbox').removeClass('col-xl-2');
        $('.pendingupgradesbox').addClass('col-xl-3');

        $('.teamsbox').removeClass('col-xl-2');
        $('.teamsbox').addClass('col-xl-3');

        $('.departmentsbox').removeClass('col-xl-2');
        $('.departmentsbox').addClass('col-xl-3');

        $('.departmentsbox').removeClass('col-md-3');
        $('.departmentsbox').addClass('col-md-12');


        $('.company1').hide();
        $('.building1').hide();
        $('.building2').hide();
        $('.company2').hide();
        $('.company3').hide();
      }
      if (userInfo.level == 'Department' || userInfo.level == 'department') {
        $("#invite_admin_1 option[value='company']").remove();
        $("#invite_admin_1 option[value='building']").remove();
        $('.raindropsbox').removeClass('col-xl-2');
        $('.raindropsbox').addClass('col-xl-4');

        $('.pendingupgradesbox').removeClass('col-xl-2');
        $('.pendingupgradesbox').addClass('col-xl-4');

        $('.teamsbox').removeClass('col-xl-2');
        $('.teamsbox').addClass('col-xl-4');

        $('.teamsbox').removeClass('col-lg-3');
        $('.teamsbox').addClass('col-lg-6');



        // col-sm-12 given but not taking full width on sm screen for teams box 

        $('.raindropsbox').removeClass('col-sm-12');
        $('.raindropsbox').addClass('col-sm-12');

        $('.pendingupgradesbox').removeClass('col-sm-12');
        $('.pendingupgradesbox').addClass('col-sm-12');

        $('.teamsbox').removeClass('col-sm-12');
        $('.teamsbox').addClass('col-sm-12');



        $('.department1').hide();
        $('.department2').hide();
        $('.company1').hide();
        $('.building1').hide();
        $('.building2').hide();
        $('.company2').hide();
        $('.company3').hide();
      }
      if (userInfo.level == 'Team' || userInfo.level == 'team') {

        $('.permissionLevelFormGroup').hide().css("visibility", "hidden");
        $('.teamsFormGroup').removeClass('col-md-6');
        $('.teamsFormGroup').addClass('col-md-12');
        $('.teamsFormGroup').removeClass('col-sm-6');
        $('.teamsFormGroup').addClass('col-sm-12');
        $('.teamsFormGroupLabel').html("Teams")
        content.items.companies.map(i => {
          i.buildings.map(j => {
            j.departments.map(k => {
              k.teams.map(l => {
                $("#invite_admin_2").append(
                  `<option value="${l.item_id}" data-name="${l.item_name
                  }">${l.item_name}
                  </option>`
                );
              })
            })
          })
        })


        $('.raindropsbox').removeClass('col-xl-6');
        $('.raindropsbox').addClass('col-xl-6');
        $('.pendingupgradesbox').removeClass('col-xl-6');
        $('.pendingupgradesbox').addClass('col-xl-6');

        $('.raindropsbox').removeClass('col-lg-3');
        $('.raindropsbox').addClass('col-lg-6');
        $('.pendingupgradesbox').removeClass('col-lg-3');
        $('.pendingupgradesbox').addClass('col-lg-6');

        $('.raindropsbox').removeClass('col-md-4');
        $('.raindropsbox').addClass('col-md-6');
        $('.pendingupgradesbox').removeClass('col-md-4');
        $('.pendingupgradesbox').addClass('col-md-6');

        $('.team1').hide();
        $('.team2').hide();
        $('.department1').hide();
        $('.department2').hide();
        $('.company1').hide();
        $('.building1').hide();
        $('.building2').hide();
        $('.company2').hide();
        $('.company3').hide();

        $(".rainDrop:first-child").hide();

      }


      let pending_upgrades_count = 0;
      let roles_count = 0;
      let raindrops_count = 0;
      let teams_count = 0;
      let departments_count = 0;
      let buildings_count = 0;
      let company_count = 0;

      let raindropsarray = [];
      let pendingupgradearray = [];
      let departmentsarray = [];
      let companiesarray = [];
      let buildingsarray = [];
      let teamsarray = [];

      function pendingUpgradesCount() {
        company_array.forEach(function (value, index) {
          company_count++;
          option_formating = value["item_name"];
          buildingsObj = value["buildings"];
          companiesarray.push(value);
          for (const [key0, value0] of Object.entries(buildingsObj)) {
            buildings_count++;
            buildingsarray.push(value0);
            departmentsObj = value0["departments"];
            if (departmentsObj !== undefined) {
              for (const [key1, value1] of Object.entries(departmentsObj)) {
                departments_count++;
                departmentsarray.push(value1);
                teamsObj = value1["teams"];
                if (teamsObj !== undefined) {
                  for (const [key2, value2] of Object.entries(teamsObj)) {
                    teams_count++;
                    teamsarray.push(value2);
                    raindropsObj = value2["raindrops"];
                    if (raindropsObj !== undefined) {
                      for (const [key3, value3] of Object.entries(
                        raindropsObj
                      )) {
                        raindropsarray.push(value3);
                        raindrops_count++;
                        if (value3["upgrade_requested"] == "true") {
                          pending_upgrades_count++;
                          pendingupgradearray.push(value3);
                        }
                      }
                    }
                  }
                };
              }
            }
          }
        });

        companiesarray.forEach((company) => {
          company.buildings?.forEach((building) => {
            building.departments?.forEach((department) => {
              department.teams?.forEach((team) => {
                team.raindrops?.forEach((raindrop) => {
                  console.log(raindrop.role);
                  roles_count++;
                });
              });
            });
          });
        });
      }


      const company_array = content["items"]["companies"];
      function checkCompanies(company_array) {
        if (Array.isArray(company_array) && company_array.length > 0) {
          Swal.fire({
            title: 'No Companies Present',
            text: "You Currently don't have any companies to build upon, please add a company to start using RainDrop",
            icon: 'warning',
            confirmButtonText: 'Ok',
          });
          $('#addcompanyModal').modal('show');
        } else {
          console.log("No items in the array to iterate over.");
        }
      }
      checkCompanies(company_array);
      // pendingUpgradesCount();
      raindropsarrays = raindropsarray;


      $("#electricity_count").text(
        numberWithCommas(content["environmental_detail"]["electricity_saved"])
      );
      $("#ewaste_count").text(
        numberWithCommas(content["environmental_detail"]["ewaste_prevented"])
      );
      $("#water_count").text(
        numberWithCommas(
          content["environmental_detail"]["resources_preserved"]["water"]
        )
      );
      $("#metals_count").text(
        numberWithCommas(
          content["environmental_detail"]["resources_preserved"]["metals"]
        )
      );
      $("#plastics_count").text(
        numberWithCommas(
          content["environmental_detail"]["resources_preserved"]["plastics"]
        )
      );

      $("#user_count").text(numberWithCommas(raindrops_count));
      $("#roles_count").text(numberWithCommas(roles_count));
      $("#pending_upgrades").text(numberWithCommas(pending_upgrades_count));
      $("#pending_upgrades_span").text(
        numberWithCommas(pending_upgrades_count)
      );
      $("#team_count").text(numberWithCommas(teams_count));
      $("#department_count").text(numberWithCommas(departments_count));
      $("#building_count").text(numberWithCommas(buildings_count));
      $("#company_count").text(numberWithCommas(company_count));
      $("#finance_this").text(
        numberWithCommas(currency + content["financial_data"]["this_month"])
      );
      $("#finance_last").text(
        numberWithCommas(currency + content["financial_data"]["last_month"])
      );

      $("#billing_pils_tier").text(content["pricing"]["level"]);
      $("#billing_pils_this_month").text(
        numberWithCommas(currency + content["financial_data"]["this_month"])
      );
      $("#billing_pils_last_month").text(
        numberWithCommas(currency + content["financial_data"]["last_month"])
      );

      $("#item_name").text(content["item_name"]);

      // ---------------------
      //    Invite Admin
      // ---------------------

      $("#inviteAdminLink").click(function (event) {
        Swal.fire({
          title: 'Setting Up Admin',
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        event.preventDefault(); // Prevent the default link behavior
        // Get input values
        let permissionLevel = $("#invite_admin_1").val();
        let item_id = $("#invite_admin_2").val();
        let item_name = $("#invite_admin_2").text();
        let firstName = $("#invite_first_name").val();
        let lastName = $("#invite_last_name").val();
        let email = $("#invite_email").val();

        // Construct invite_admin_data
        let invite_admin_data = {
          query: "inviteadmin",
          item_id: item_id,
          account_id: userInfo["account_id"],
          email: email,
          first_name: firstName,
          last_name: lastName
        };

        $.ajax({
          url: base_url + "/management",
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          contentType: 'application/json',
          data: JSON.stringify(invite_admin_data),
          success: function (response) {
            Swal.fire({
              title: 'Done',
              text: email + " invited to the " + permissionLevel + " " + item_name,
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
          },
          error: function (error) {
            Swal.fire({
              title: 'Error',
              text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        });
      });

      // ---------------------------------
      //    Main Table Functions
      // --------------------------------

      // --------------------------
      //    Remove Role
      // -------------------------


      // --------------------------
      //    Remove account
      // -------------------------

      $("#delete_account_button").click(function (event) {
        Swal.fire({
          title: 'Removing Your Account',
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        event.preventDefault(); // Prevent the default link behavior
        const itemId = activeItem;

        // Prepare the payload
        let delete_building_data = {
          query: "removeaccount",
          ip: public_ip,
          email: userInfo["email"],
          account_id: userInfo["account_id"]
        };

        $.ajax({
          url: base_url + "/management",
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          contentType: 'application/json',
          data: JSON.stringify(delete_building_data),
          success: function (response) {

            Swal.fire({
              title: 'Done',
              text: "Account Removed Successfully.",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.href = "https://www.raindroprdp.com";
              }
            });
            // Handle the success response here
          },
          error: function (error) {
            Swal.fire({
              title: 'Error',
              text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        });
      });

      // ---------------------------------
      //    RainDrop Detail Modal Functions
      // --------------------------------


      // ---------------------
      //    Create role
      // ---------------------

      $("#converttorole_button").click(function (event) {
        Swal.fire({
          title: 'Converting your RainDrop to a Role',
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        event.preventDefault(); // Prevent the default link behavior
        const itemId = activeItem;
        let name = $("#converttorole_name").val();
        // Construct invite_admin_data
        let invite_admin_data = {
          query: "createrole",
          instance_id: itemId,
          name: name,
          account_id: userInfo["account_id"],
          email: userInfo["email"]
        };

        $.ajax({
          url: base_url + "/management",
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          contentType: 'application/json',
          data: JSON.stringify(invite_admin_data),
          success: function (response) {

            Swal.fire({
              title: 'Done',
              text: "Converted this RainDrop to a Role",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
            // Handle the success response here
          },
          error: function (error) {
            Swal.fire({
              title: 'Error',
              text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        });
      });

      // ---------------------
      //    Upgrade Now
      // ---------------------

      $("#upgrade_button").click(function (event) {
        Swal.fire({
          title: 'Upgrading your RainDrop',
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        event.preventDefault(); // Prevent the default link behavior
        const selectedOption = $('.specs2-select').find('option:selected');
        const option = $('.specs2-select').find('option:selected').text();
        const itemId = activeItem;
        const typeId = selectedOption.data('typeid');
        console.log(option);
        // Construct invite_admin_data
        let invite_admin_data = {
          query: "upgradenow",
          item_id: itemId,
          type_id: typeId,
          ip: public_ip,
          account_id: userInfo["account_id"],
          email: userInfo["email"]
        };

        $.ajax({
          url: base_url + "/management",
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          contentType: 'application/json',
          data: JSON.stringify(invite_admin_data),
          success: function (response) {

            Swal.fire({
              title: 'Done',
              text: "Package Upgraded To" + option,
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
            // Handle the success response here
          },
          error: function (error) {
            Swal.fire({
              title: 'Error',
              text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        });
      });

      // --------------------------
      //    Update RainDrop Email
      // -------------------------

      $("#updateraindropemail_button").click(function (event) {
        Swal.fire({
          title: "Updating this RainDrop's user",
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        event.preventDefault(); // Prevent the default link behavior
        const itemId = activeItem;
        let new_email = $("#updateraindropemail_email").val();
        let firstName = $("#updateraindropemail_first_name").val();
        let lastName = $("#updateraindropemail_last_name").val();
        // Prepare the payload
        let updateraindropemail_data = {
          query: "updateraindropemail",
          item_id: itemId,
          new_email: new_email,
          ip: public_ip,
          first_name: firstName,
          last_name: lastName,
          email: userInfo["email"],
          account_id: userInfo["account_id"]
        };

        $.ajax({
          url: base_url + "/management",
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          contentType: 'application/json',
          data: JSON.stringify(updateraindropemail_data),
          success: function (response) {

            Swal.fire({
              title: 'Done',
              text: "Invited " + new_email + " to this RainDrop",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
            // Handle the success response here
          },
          error: function (error) {
            Swal.fire({
              title: 'Error',
              text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        });
      });

      // --------------------------
      //    Reboot
      // -------------------------

      $("#reboot_button").click(function (event) {
        Swal.fire({
          title: 'Rebooting this RainDrop',
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        event.preventDefault(); // Prevent the default link behavior
        const itemId = activeItem;
        let new_email = $("#updateuser_email").val();
        // Prepare the payload
        let reboot_raindrop_data = {
          query: "rebootmachine",
          instance_id: itemId,
          ip: public_ip,
          email: userInfo["email"],
          account_id: userInfo["account_id"]
        };

        $.ajax({
          url: base_url + "/management",
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          contentType: 'application/json',
          data: JSON.stringify(reboot_raindrop_data),
          success: function (response) {

            Swal.fire({
              title: 'Done',
              text: "RainDrop Rebooted Successfully, please wait 3 minutes before connecting to it again.",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
            // Handle the success response here
          },
          error: function (error) {
            Swal.fire({
              title: 'Error',
              text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        });
      });


      // --------------------------
      //    Remove RainDrop
      // -------------------------

      $("#delete_raindrop_button").click(function (event) {
        Swal.fire({
          title: 'Removing this RainDrop',
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        event.preventDefault(); // Prevent the default link behavior
        const itemId = activeItem;
        // Prepare the payload
        let reboot_raindrop_data = {
          query: "removeraindrop",
          instance_id: itemId,
          ip: public_ip,
          email: userInfo["email"],
          account_id: userInfo["account_id"]
        };

        $.ajax({
          url: base_url + "/management",
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          contentType: 'application/json',
          data: JSON.stringify(reboot_raindrop_data),
          success: function (response) {

            Swal.fire({
              title: 'Done',
              text: "RainDrop Removed Successfully",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
            // Handle the success response here
          },
          error: function (error) {
            Swal.fire({
              title: 'Error',
              text: "The submission was not successful.  Please Try again.  If the problem persists, please visit our support site: https://www.raindroprdp.com/support.html",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        });
      });


      function pricechange() {
        let totalPrice = 0;
        $('.specs-select').each(function () {
          const selectedOption = $(this).find('option:selected[data-price]');
          if (selectedOption.length) {
            const price = parseInt(selectedOption.data('price'));
            totalPrice += price;
          }
        });

        $("#monthly_change").text(`${currency}${totalPrice}`);
        // $("#monthly_upgrade_change").text(`${currency}${triggerPrice}`);
      }



      $(document).on("click", ".action .delete a", function (e) {
        $(this).parents('.member-block').remove();
        pricechange();
      });
      // function upgradepricechange() {
      //   upgrademonthlychange = 0;
      //   $(".specs-select").each(function () {
      //     // alert($(this).data('price'));
      //     upgrademonthlychange += $(this).find(":selected").data("price");
      //   });
      //   $("#monthly_upgrade_change").text(`${currency}${upgrademonthlychange}`);
      // }



      $(".add-member").click(function () {
        optionhtml = ``;
        osbydefault = "windows"; // or linux
        content["pricing"][osbydefault].forEach(function (value, index) {
          optionhtml += `<option value="${value["type_id"]}" data-price="${value["price"]}">(${value["type"]}) CPU: ${value["cpu"]}, RAM: ${value["ram"]}. ${value["price"]}${currency}</option>`;
        });
        oshtml = ``;

        try {
          let unique_os_types = new Set();
          content["default_roles"].forEach(function (value, index) {
            if (!unique_os_types.has(value["os_type"])) {
              oshtml += `<option value="${value["os_type"]}" data-id="${value["id"]}">Default [${value["os_type"]}]</option>`;
              unique_os_types.add(value["os_type"]);
            }
          });
        } catch (error) {
          console.log(error);
        }

        let memberblock = `<div class="member-block" style="display: flex; flex-direction: column; align-items: center; position: relative;">
                            <!-- Rows for Dropdowns -->
                            <div class="row" style="margin-bottom: 5px; width: 100%;">
                                <!-- Specs Select -->
                                <div class="col-6 col-sm-6 col-md-4">
                                    <div class="form-group">
                                        <select class="form-select form-control specs-select" style="width: 100%; max-width: 100%;">
                                            ${optionhtml}
                                        </select>
                                    </div>
                                </div>
                                <!-- Role Select -->
                                <div class="col-6 col-sm-6 col-md-4">
                                    <div class="form-group">
                                        <select name="" class="form-select form-control os-select" id="" style="width: 100%; max-width: 100%;">
                                            ${oshtml}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        
                            <!-- Rows for First Name, Last Name, and Email -->
                            <div class="row" style="width: 100%;">
                                <!-- First Name -->
                                <div class="col-6 col-sm-6 col-md-2">
                                    <div class="form-group">
                                        <input type="text" class="form-control rd-first_name" placeholder="user's first name" required>
                                    </div>
                                </div>
                                <!-- Last Name -->
                                <div class="col-6 col-sm-6 col-md-2">
                                    <div class="form-group">
                                        <input type="text" class="form-control rd-last_name" placeholder="user's last name" required>
                                    </div>
                                </div>
                                <!-- Email -->
                                <div class="col-6 col-sm-6 col-md-4">
                                    <div class="form-group">
                                        <input type="email" class="form-control rd-email" placeholder="user's email" required>
                                    </div>
                                </div>
                            </div>
                        
                            <!-- Thin White Line -->
                            <div style="height: 1px; background-color: white; margin-top: 10px; width: 100%;"></div>
                        
                            <!-- Delete SVG Icon -->
                            <div class="action" style="display: flex; justify-content: center; position: absolute; right: 0; top: 50%; transform: translateY(-50%);">
                                <div class="delete" style="margin-left: unset;">
                                    <a href="#">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="35"
                                        height="35" viewBox="0 0 35 35">
                                        <g id="Group_7038" data-name="Group 7038"
                                            transform="translate(-1670 -949)">
                                            <g id="Path_2516" data-name="Path 2516"
                                                transform="translate(1670 949)"
                                                fill="rgba(253,177,40,0.06)">
                                                <path
                                                    d="M 30 34.5 L 5 34.5 C 2.51869010925293 34.5 0.5 32.4813117980957 0.5 30 L 0.5 5 C 0.5 2.51869010925293 2.51869010925293 0.5 5 0.5 L 30 0.5 C 32.4813117980957 0.5 34.5 2.51869010925293 34.5 5 L 34.5 30 C 34.5 32.4813117980957 32.4813117980957 34.5 30 34.5 Z"
                                                    stroke="none" />
                                                <path
                                                    d="M 5 1 C 2.794391632080078 1 1 2.794391632080078 1 5 L 1 30 C 1 32.20560836791992 2.794391632080078 34 5 34 L 30 34 C 32.20560836791992 34 34 32.20560836791992 34 30 L 34 5 C 34 2.794391632080078 32.20560836791992 1 30 1 L 5 1 M 5 0 L 30 0 C 32.76142120361328 0 35 2.238571166992188 35 5 L 35 30 C 35 32.76142120361328 32.76142120361328 35 30 35 L 5 35 C 2.238571166992188 35 0 32.76142120361328 0 30 L 0 5 C 0 2.238571166992188 2.238571166992188 0 5 0 Z"
                                                    stroke="none" fill="#fdb128" />
                                            </g>
                                            <g id="trash_1_" data-name="trash (1)"
                                                transform="translate(1678.213 957.756)">
                                                <path id="Path_2516-2" data-name="Path 2516"
                                                    d="M15.845,2.915H13.586A3.65,3.65,0,0,0,10.015,0H8.558A3.65,3.65,0,0,0,4.988,2.915H2.729a.729.729,0,1,0,0,1.457h.729v9.473A3.648,3.648,0,0,0,7.1,17.488h4.372a3.648,3.648,0,0,0,3.643-3.643V4.372h.729a.729.729,0,1,0,0-1.457ZM8.558,1.457h1.457a2.19,2.19,0,0,1,2.061,1.457H6.5A2.19,2.19,0,0,1,8.558,1.457Zm5.1,12.388a2.186,2.186,0,0,1-2.186,2.186H7.1a2.186,2.186,0,0,1-2.186-2.186V4.372h8.744Z"
                                                    fill="#fdb128" />
                                                <path id="Path_2517" data-name="Path 2517"
                                                    d="M9.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,0,0-1.457,0V15.1A.729.729,0,0,0,9.729,15.829Z"
                                                    transform="translate(-1.899 -2.713)"
                                                    fill="#fdb128" />
                                                <path id="Path_2518" data-name="Path 2518"
                                                    d="M13.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,1,0-1.457,0V15.1A.729.729,0,0,0,13.729,15.829Z"
                                                    transform="translate(-2.985 -2.713)"
                                                    fill="#fdb128" />
                                            </g>
                                        </g>
                                    </svg>
                                    </a>
                                </div>
                            </div>
                        </div>`;

        $(".member-list").append(memberblock);
        pricechange();
      });

      $(".add-member").click();

      $(document).on("change", ".os-select", function () {
        let select = $(this);
        let memberblock = select.parents(".member-block");
        let specs = memberblock.find(".specs-select");
        specs.html("");
        // $('.specs-select').html('');
        content["pricing"][select.val()].forEach(function (value, index) {
          specs.append(
            `<option value="${value["type"]}" (${value["type_id"]}) data-price="${value["price"]}">(${value["type"]}) CPU: ${value["cpu"]}, RAM: ${value["ram"]}. ${value["price"]}${currency}</option>`
          );
        });
        pricechange();
      });

      $(document).on("change", ".specs-select", function () {
        pricechange();
      });


      $(document).on("change", ".specs2-select", function () {
        upgradePrice();
      });


      $(".member-list").on("DOMSubtreeModified", function () {
        // console.log('changed');
        // pricechange();
      });

      function getCompanyKey(name) {
        // console.log(name);
        let key = 0;
        content["items"]["companies"]?.forEach(function (value, index) {
          if (name == value["item_name"]) {
            // console.log(index);
            key = index;
          }
        });
        return key;
      }
      function getCompanyRoles(item_id) {
        // console.log(name); 
        let key = "";
        content["items"]["companies"]?.forEach(function (value, index) {
          if (item_id == value["item_id"]) {
            key = value["roles"];
          }
        });

        return key;
      }

      content["items"]["companies"]?.forEach(function (value, index) {
        $("#dropdown_company").append(`<li>
                    <a class="dropdown-item company_picker" data-name="${value["item_name"]}" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19.52" height="19.519"
                            viewBox="0 0 19.52 19.519">
                            <path id="bank"
                                d="M19.518,18.7a.813.813,0,0,1-.813.813H.813a.813.813,0,1,1,0-1.626H18.7A.813.813,0,0,1,19.518,18.7ZM.236,6.955A1.987,1.987,0,0,1,.361,4.868a3.835,3.835,0,0,1,1.356-1.22L7.817.473a4.208,4.208,0,0,1,3.882,0L17.8,3.65a3.835,3.835,0,0,1,1.356,1.22,1.987,1.987,0,0,1,.124,2.087,2.206,2.206,0,0,1-1.965,1.175h-.237v6.506h.813a.813.813,0,0,1,0,1.626H1.626a.813.813,0,0,1,0-1.626h.813V8.132H2.2A2.206,2.206,0,0,1,.236,6.955Zm3.83,7.684h2.44V8.132H4.066ZM8.132,8.132v6.506h3.253V8.132Zm7.319,0h-2.44v6.506h2.44ZM1.677,6.2a.583.583,0,0,0,.525.3H17.315a.583.583,0,0,0,.525-.3.368.368,0,0,0-.02-.407,2.2,2.2,0,0,0-.772-.7l-6.1-3.177a2.583,2.583,0,0,0-2.38,0L2.47,5.091a2.206,2.206,0,0,0-.772.7.368.368,0,0,0-.021.406Z"
                                transform="translate(0.002 0.002)" fill="#fff" />
                        </svg>
                        ${value["item_name"]}
                    </a>
                </li>`);
        $("#rd_modal_company").append(
          `<option value="${value["item_id"]}">${value["item_name"]}</option>`
        );
      });

      function createDropdown2(picked_company) {
        $("#dropdown_2").html(""); // clear dropdown
        picked_company_id = getCompanyKey(picked_company) || 0;
        picked_company_array = content["items"]["companies"][picked_company_id];

        picked_company_array["buildings"].forEach(function (value, index) {
          $("#dropdown_2").append(`<li>
                        <a class="dropdown-item" href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" width="19.52" height="19.519"
                                viewBox="0 0 19.52 19.519">
                                <path id="bank"
                                    d="M19.518,18.7a.813.813,0,0,1-.813.813H.813a.813.813,0,1,1,0-1.626H18.7A.813.813,0,0,1,19.518,18.7ZM.236,6.955A1.987,1.987,0,0,1,.361,4.868a3.835,3.835,0,0,1,1.356-1.22L7.817.473a4.208,4.208,0,0,1,3.882,0L17.8,3.65a3.835,3.835,0,0,1,1.356,1.22,1.987,1.987,0,0,1,.124,2.087,2.206,2.206,0,0,1-1.965,1.175h-.237v6.506h.813a.813.813,0,0,1,0,1.626H1.626a.813.813,0,0,1,0-1.626h.813V8.132H2.2A2.206,2.206,0,0,1,.236,6.955Zm3.83,7.684h2.44V8.132H4.066ZM8.132,8.132v6.506h3.253V8.132Zm7.319,0h-2.44v6.506h2.44ZM1.677,6.2a.583.583,0,0,0,.525.3H17.315a.583.583,0,0,0,.525-.3.368.368,0,0,0-.02-.407,2.2,2.2,0,0,0-.772-.7l-6.1-3.177a2.583,2.583,0,0,0-2.38,0L2.47,5.091a2.206,2.206,0,0,0-.772.7.368.368,0,0,0-.021.406Z"
                                    transform="translate(0.002 0.002)" fill="#fff" />
                            </svg>
                            ${value["item_name"]}
                        </a>
                    </li>`);

          departmentsObj = value["departments"];

          for (const [key0, value0] of Object.entries(departmentsObj)) {
            $("#dropdown_2").append(`<li style="padding-left: 10px;">
                            <a class="dropdown-item" href="#">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18.36" height="18.358"
                                    viewBox="0 0 18.36 18.358">
                                    <path id="chart-tree"
                                        d="M16.725,13.867a4.083,4.083,0,0,0-3.97-3.157H10.327V9.473a4.805,4.805,0,1,0-2.295,0V10.71H5.6a4.083,4.083,0,0,0-3.97,3.157,2.295,2.295,0,1,0,2.234.528A1.783,1.783,0,0,1,5.6,13H8.032v1.071a2.295,2.295,0,1,0,2.295,0V13h2.428a1.783,1.783,0,0,1,1.736,1.39,2.295,2.295,0,1,0,2.234-.528ZM6.669,4.807A2.511,2.511,0,1,1,9.179,7.317,2.511,2.511,0,0,1,6.669,4.807Z"
                                        transform="translate(0.001 -0.002)" fill="#fff" />
                                </svg>
                                ${value0["item_name"]}
                            </a>
                        </li>`);

            teamsObj = value0["teams"];

            console.log(teamsObj);

            if (teamsObj !== undefined) {
              for (const [key1, value1] of Object.entries(teamsObj)) {
                $("#dropdown_2").append(`<li style="padding-left: 20px;">
                                    <a class="dropdown-item" href="#">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20.706" height="20.706" viewBox="0 0 20.706 20.706">
                                        <path id="users" d="M6.471,11.216a3.882,3.882,0,1,1,3.882-3.882,3.882,3.882,0,0,1-3.882,3.882Zm0-6.039A2.157,2.157,0,1,0,8.628,7.333,2.157,2.157,0,0,0,6.471,5.177Zm6.471,14.667v-.431A6.471,6.471,0,0,0,0,19.412v.431a.863.863,0,1,0,1.726,0v-.431a4.745,4.745,0,1,1,9.49,0v.431a.863.863,0,1,0,1.726,0Zm7.765-4.314a6.039,6.039,0,0,0-10.066-4.5.863.863,0,1,0,1.151,1.286,4.314,4.314,0,0,1,7.189,3.215.863.863,0,0,0,1.726,0ZM15.1,7.765a3.882,3.882,0,1,1,3.882-3.882A3.882,3.882,0,0,1,15.1,7.765Zm0-6.039a2.157,2.157,0,1,0,2.157,2.157A2.157,2.157,0,0,0,15.1,1.726Z" fill="#fff"></path>
                                    </svg>
                                    ${value1["item_name"]}
                                    </a>
                                </li>`);
              }
            }
          }
        });
      }

      setInterval(() => {
        $(".chart-spinner").fadeOut(500);
      }, 500);



      if (userInfo.level == 'Account' || userInfo.level == 'account') {

        function rdModalDropdown2(picked_company) {
          $("#rd_modal_details").html(""); // clear dropdown

          const selectedCompany = content.items?.companies.find(company => company.item_id === picked_company);

          if (selectedCompany) {
            selectedCompany.buildings?.forEach(building => {
              building.departments?.forEach(department => {
                department.teams?.forEach(team => {
                  const optionText = `${building.item_name} -> ${department.item_name} -> ${team.item_name}`;
                  $("#rd_modal_details").append(
                    `<option value="${team.item_id}" data-name="${team.item_name}">${optionText}</option>`
                  );
                });
              });
            });
          }
        }


        function rdModalDropdown2(picked_company) {
          $("#rd_modal_details").html(""); // clear dropdown
          content.items?.companies.map(i => {
            i.buildings.map(j => {
              j.departments.map(k => {
                k.teams.map(l => {
                  let optionText = `${j.item_name} -> ${k.item_name} -> ${l.item_name}`;
                  $("#rd_modal_details").append(
                    `<option value="${l.item_id}" data-name="${l.item_name
                    }">${optionText}
                    </option>`
                  );
                  // console.log(l);
                })
              })
            })
          })
        }
      }
      if (userInfo.level == 'Company' || userInfo.level == 'company') {
        function rdModalDropdown2(picked_company) {
          $("#rd_modal_details").html(""); // clear dropdown
          content.items?.companies.map(i => {
            i.buildings.map(j => {
              j.departments.map(k => {
                k.teams.map(l => {

                  $("#rd_modal_details").append(
                    `<option value="${l.item_id}" data-name="${l.item_name
                    }">${l.item_name}
                    </option>`
                  );
                  // console.log(l);
                })
              })
            })
          })
        }
      }

      if (userInfo.level == 'Building' || userInfo.level == 'building') {

        function rdModalDropdown2(picked_company) {
          $("#rd_modal_details").html(""); // clear dropdown
          content.items?.companies.map(i => {
            i.buildings.map(j => {
              j.departments.map(k => {
                k.teams.map(l => {

                  $("#rd_modal_details").append(
                    `<option value="${l.item_id}" data-name="${l.item_name
                    }">${l.item_name}
                    </option>`
                  );
                  // console.log(l);
                })
              })
            })
          })
        }
      }


      if (userInfo.level == 'Department' || userInfo.level == 'department') {
        function rdModalDropdown2(picked_company) {
          $("#rd_modal_details").html(""); // clear dropdown
          content.items?.companies.map(i => {
            i.buildings.map(j => {
              j.departments.map(k => {
                k.teams.map(l => {

                  $("#rd_modal_details").append(
                    `<option value="${l.item_id}" data-name="${l.item_name
                    }">${l.item_name}
                    </option>`
                  );
                  // console.log(l);
                })
              })
            })
          })
        }
      }

      if (userInfo.level == 'Team' || userInfo.level == 'team') {
        function rdModalDropdown2(picked_company) {
          $("#rd_modal_details").html(""); // clear dropdown
          content.items?.companies.map(i => {
            i.buildings.map(j => {
              j.departments.map(k => {
                k.teams.map(l => {

                  $("#rd_modal_details").append(
                    `<option value="${l.item_id}" data-name="${l.item_name
                    }">${l.item_name}
                    </option>`
                  );
                  // console.log(l);
                })
              })
            })
          })
        }
      }









      // picked_company_id = getCompanyKey(picked_company);
      // // picked_company_id = '5'
      // console.log(picked_company);
      // console.log(picked_company_id);
      // picked_company_array = content["items"]["companies"][picked_company_id];
      // // console.log(picked_company_array['buildings']);
      // picked_company_array["buildings"].forEach(function (value, index) {
      //   option_formating = "";
      //   option_formating = value["item_name"];
      //   departmentsObj = value["departments"];
      //   // console.log(departmentsObj);
      //   for (const [key0, value0] of Object.entries(departmentsObj)) {
      //     // option_formating = option_formating + ' -> ' + value0['name'];
      //     teamsObj = value0["teams"];
      //     if (teamsObj !== undefined) {
      //       for (const [key1, value1] of Object.entries(teamsObj)) {
      //         // option_formating = option_formating + ' -> ' + value0['name'] + ' -> ' + value1['name'];
      //         $("#rd_modal_details").append(
      //           `<option value="${value1["item_id"]}" data-name="${value1["item_name"]
      //           }">${option_formating +
      //           " -> " +
      //           value0["item_name"] +
      //           " -> " +
      //           value1["item_name"]
      //           }</option>`
      //         );
      //       }
      //     }
      //   }
      // });

      // picked_company = getCompanyKey('company01');

      picked_company = getCompanyKey(content["items"]["companies"][index]);
      picked_company_name = content["items"]["companies"][picked_company];
      $("#dropdown_company_button").text(picked_company_name);

      createDropdown2(picked_company);
      rdModalDropdown2(picked_company);
      company_name = $(this).data("item_name");
      createDropdown2(company_name);
      $(".company_picker").click(function () {
        picked_company = getCompanyKey(content["items"]["companies"][index]);
        picked_company_name = content["items"]["companies"][picked_company];
        $("#dropdown_company_button").text(picked_company_name);
        console.log('asdfsdafsafasfsad');
        createDropdown2(picked_company);
        rdModalDropdown2(picked_company);
        company_name = $(this).data("item_name");
        createDropdown2(company_name);
        $("#dropdown_company_button").text(company_name);
        // alert('Company' + company_name + ' picked!');
      });

      $("#rd_modal_company").change(function () {

        rdModalDropdown2($("#rd_modal_company :selected").val());
        // extra
        $(".os-select").empty();
        let unique_os_types = new Set();
        content["default_roles"].forEach(function (value, index) {
          if (!unique_os_types.has(value["role_name"])) {
            $(".os-select").append(`<option value="${value["os_type"]}" data-id="${value["id"]}">Default [${value["os_type"]}]</option>`);
            unique_os_types.add(value["role_name"]);
          }
        });
        let item_id = $(this).find(":selected").val();
        let companies_roles = getCompanyRoles(item_id);
        let unique_role_name = new Set();
        companies_roles.forEach(function (value, index) {
          if (!unique_role_name.has(value["role_name"])) {
            $(".os-select").append(`<option value="${value["os_type"]}" data-id="${value["id"]}">${value["role_name"]} [${value["os_type"]}]</option>`);
            unique_role_name.add(value["role_name"]);
          }
        });

      });

      $("#rd_modal_details").change(function () {
        // alert($(this).val())
        $("#rd_name_team_add").text(
          $("#rd_modal_details option:selected").data("name")
        );
      });


      invite_admin_pick = "company";
      inviteAdminDrop2(invite_admin_pick);

      $("#invite_admin_1").change(function () {
        // alert($(this).val())
        inviteAdminDrop2($(this).val());
      });
      console.log(company_array = content["items"]["companies"][1]);
      function capitalize(str) {
        return str.toLowerCase().replace(/(?<= )[^\s]|^./g, a => a.toUpperCase());
      }
      function inviteAdminDrop2(picked) {
        $(".adminlbl").html(capitalize(picked));
        $("#invite_admin_2").html("");
        company_array = content["items"]["companies"];

        if (picked == "company") {
          company_array.forEach(function (value, index) {
            // option_formating = value['name'];
            $("#invite_admin_2").append(
              `<option value="${value["item_id"]}">${value["item_name"]}</option>`
            );
          });
        }

        if (picked == "building") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              $("#invite_admin_2").append(
                `<option value="${value["item_id"]}">${option_formating + " -> " + value0["item_name"]
                }</option>`
              );
            }
          });
        }

        if (picked == "department") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              departmentsObj = value0["departments"];
              if (departmentsObj !== undefined) {
                for (const [key1, value1] of Object.entries(departmentsObj)) {
                  $("#invite_admin_2").append(
                    `<option value="${value["item_id"]}">${option_formating +
                    " -> " +
                    value0["item_name"] +
                    " -> " +
                    value1["item_name"]
                    }</option>`
                  );
                }
              }
            }
          });
        }

        if (picked == "team") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              departmentsObj = value0["departments"];
              if (departmentsObj !== undefined) {
                for (const [key1, value1] of Object.entries(departmentsObj)) {
                  teamsObj = value1["teams"];
                  if (teamsObj !== undefined) {
                    for (const [key2, value2] of Object.entries(teamsObj)) {
                      // option_formating = option_formating + ' -> ' + value0['name'] + ' -> ' + value1['name'];
                      $("#invite_admin_2").append(
                        `<option value="${value["item_id"]}">${option_formating +
                        " -> " +
                        value0["item_name"] +
                        " -> " +
                        value1["item_name"] +
                        " -> " +
                        value2["item_name"]
                        }</option>`
                      );
                    }
                  }
                }
              }
            }
          });
        }
      }

      chart_1_pick = "company";
      chart1(chart_1_pick);

      $("#chart_1_1").change(function () {
        // alert($(this).val())
        chart1($(this).val());
      });

      function chart1(picked) {
        $("#chart_1_2").html("");
        company_array = content["items"]["companies"];

        if (picked == "company") {
          company_array.forEach(function (value, index) {
            // option_formating = value['name'];
            $("#chart_1_2").append(
              `<option value="">${value["item_name"]}</option>`
            );
          });
        }

        if (picked == "building") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              $("#chart_1_2").append(
                `<option value="">${option_formating + " -> " + value0["item_name"]
                }</option>`
              );
            }
          });
        }

        if (picked == "department") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              departmentsObj = value0["departments"];
              if (departmentsObj !== undefined) {
                for (const [key1, value1] of Object.entries(departmentsObj)) {
                  $("#chart_1_2").append(
                    `<option value="">${option_formating +
                    " -> " +
                    value0["item_name"] +
                    " -> " +
                    value1["item_name"]
                    }</option>`
                  );
                }
              }
            }
          });
        }

        if (picked == "team") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              departmentsObj = value0["departments"];
              if (departmentsObj !== undefined) {
                for (const [key1, value1] of Object.entries(departmentsObj)) {
                  teamsObj = value1["teams"];
                  if (teamsObj !== undefined) {
                    for (const [key2, value2] of Object.entries(teamsObj)) {
                      // option_formating = option_formating + ' -> ' + value0['name'] + ' -> ' + value1['name'];
                      $("#chart_1_2").append(
                        `<option value="">${option_formating +
                        " -> " +
                        value0["item_name"] +
                        " -> " +
                        value1["item_name"] +
                        " -> " +
                        value2["item_name"]
                        }</option>`
                      );
                    }
                  }
                }
              }
            }
          });
        }
      }

      function modalselector(picked, selector_id) {
        $(selector_id).html("");
        company_array = content["items"]["companies"];

        if (picked == "company") {
          company_array.forEach(function (value, index) {
            // option_formating = value['name'];
            $(selector_id).append(
              `<option value="${value["item_id"]}">${value["item_name"]}</option>`
            );
          });
        }

        if (picked == "building") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              $(selector_id).append(
                `<option value="${value0["item_id"]}">${option_formating + " -> " + value0["item_name"]
                }</option>`
              );
            }
          });
        }

        if (picked == "department") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              departmentsObj = value0["departments"];
              if (departmentsObj !== undefined) {
                for (const [key1, value1] of Object.entries(departmentsObj)) {
                  $(selector_id).append(
                    `<option value="${value1["item_id"]}">${option_formating +
                    " -> " +
                    value0["item_name"] +
                    " -> " +
                    value1["item_name"]
                    }</option>`
                  );
                }
              }
            }
          });
        }

        if (picked == "team") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              departmentsObj = value0["departments"];
              if (departmentsObj !== undefined) {
                for (const [key1, value1] of Object.entries(departmentsObj)) {
                  teamsObj = value1["teams"];
                  if (teamsObj !== undefined) {
                    for (const [key2, value2] of Object.entries(teamsObj)) {
                      // option_formating = option_formating + ' -> ' + value0['name'] + ' -> ' + value1['name'];
                      $(selector_id).append(
                        `<option value="${value2["item_id"]}">${option_formating +
                        " -> " +
                        value0["item_name"] +
                        " -> " +
                        value1["item_name"] +
                        " -> " +
                        value2["item_name"]
                        }</option>`
                      );
                    }
                  }
                }
              }
            }
          });
        }
      }

      // table admin block

      $(".table-admin").click(function () {
        $(".table-admin").removeClass("active");
        $(this).addClass("active");

        $("#table_header").text($(this).data("name"));
        $(".only-raindrop").hide();
        $(".only-pending-updates").hide();
        if ($(this).data("name") == "Raindrops") $(".only-raindrop").show();
        if ($(this).data("name") == "Pending Upgrades")
          $(".only-pending-updates").show();
        tableformatter($(this).data("name"));
      });

      // create company
      $(".create-company").click(function () {
        companyname = $("#company_name");
        company_office_schedule = $("#company_office_schedule");
        add_company_data = `{
          "query":"addcompany",
          "company_name": "${companyname.val()}",
          "account_id": "${userInfo["account_id"]}",
          "email": "${userInfo["email"]}",
          "office_schedule": "${company_office_schedule.val()}"
        }`;
        // console.log(datacompany);
        submitbutton = $(this);
        savetext = $(this).html();
        $(this)
          .prop("disabled", true)
          .html(
            `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
          );

        $.ajax({
          url: base_url + "/management",
          type: "POST",
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          dataType: "text",
          data: add_company_data,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Done',
              text: "Company " + $("#company_name").val() + " added",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Error',
              text: "Error adding, please try again",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          });
      });

      companiesarray.forEach(function (value, index) {
        $("#building_company").append(
          `<option value="${value["item_id"]}">${value["item_name"]}</option>`
        );
      });

      // create building
      $(".create-building").click(function () {
        add_building_data = `{
                    "query": "addbuilding",
                    "company_id": "${$("#building_company").val()}",
                    "account_id": "${userInfo["account_id"]}",
                    "building_name": "${$("#building_name").val()}",
                    "building_ip": "${$("#building_ip").val()}",
                    "address1": "${$("#building_address").val()}",
                    "email": "${userInfo["email"]}",
                    "zipcode": "${$("#building_zip").val()}"
                }`;
        submitbutton = $(this);
        savetext = $(this).html();
        $(this)
          .prop("disabled", true)
          .html(
            `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
          );

        $.ajax({
          url: base_url + "/management",
          type: "POST",
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          dataType: "text",
          data: add_building_data,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Done',
              text: "Building " + $("#building_name").val() + " added",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Error',
              text: "Error adding, please try again",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          });
      });

      modalselector("building", "#department_building");
      // create department
      $(".create-department").click(function () {
        add_department_data = `{
                    "query":"adddepartment",
                    "account_id": "${userInfo["account_id"]}",
                    "building_id": "${$("#department_building").val()}",
                    "department_name": "${$("#department_name").val()}",
                    "address2": "${$("#department_address").val()}",
                    "email": "${userInfo["email"]}",
                    "contact_first_name": "${$(
          "#department_fisrt_name"
        ).val()}",
                    "contact_last_name": "${$("#department_last_name").val()}",
                    "contact_email": "${$("#department_email").val()}",
                    "contact_phone": "${$("#department_phone").val()}"
                }`;
        submitbutton = $(this);
        savetext = $(this).html();
        $(this)
          .prop("disabled", true)
          .html(
            `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
          );

        $.ajax({
          url: base_url + "/management",
          type: "POST",
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          dataType: "text",
          data: add_department_data,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Done',
              text: "Department " + $("#department_name").val() + " added",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Error',
              text: "Error adding, please try again",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          });
      });

      modalselector("department", "#team_department");
      // create department
      $(".create-team").click(function () {
        add_team_data = `{
                    "account_id": "${userInfo["account_id"]}",
                    "query": "addteam",
                    "department_id": "${$("#team_department").val()}",
                    "email": "${userInfo["email"]}",
                    "team_name": "${$("#team_name").val()}"
                }`;
        submitbutton = $(this);
        savetext = $(this).html();
        $(this)
          .prop("disabled", true)
          .html(
            `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
          );

        $.ajax({
          url: base_url + "/management",
          type: "POST",
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          dataType: "text",
          data: add_team_data,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Done',
              text: "Team " + $("#team_name").val() + " added",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Error',
              text: "Error adding, please try again",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          });
      });

      // ----------------
      // Add Raindrops
      // ---------------

      $(".create-raindrop").click(function () {
        Swal.fire({
          title: "Adding RainDrops",
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
        });
        addraindrops = [];
        $(".member-block").each(function () {
          addraindrops.push({
            type_id: $(this).find(".specs-select").val(),
            role_id: $(this).find('.os-select option:selected').data('id'),
            role_name: $(this).find(".os-select").val(),
            role_company_id: $(this).find('.os-select option:selected').data('parent_id'),
            template_id: $(this).find(".os-select").val(),
            email: $(this).find(".rd-email").val(),
            first_name: $(this).find(".rd-first_name").val(),
            last_name: $(this).find(".rd-last_name").val(),
            is_server: "n",
          });
        });

        add_raindrops_data = `{
                    "query":"addmachines",
                    "account_id": "${userInfo["account_id"]}",
                    "email": "${userInfo["email"]}",
                    "team_id": "${$("#rd_modal_details").val()}",
                    "instances": ${JSON.stringify(addraindrops)}
                }`;

        submitbutton = $(this);
        savetext = $(this).html();
        $(this)
          .prop("disabled", true)
          .html(
            `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
          );

        $.ajax({
          url: base_url + "/management",
          type: "POST",
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          dataType: "text",
          data: add_raindrops_data,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Done',
              text: "RainDrops added",
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading()
              },
              didClose: () => {
                Swal.hideLoading();
                window.location.reload(true);
              }
            });
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            Swal.fire({
              title: 'Error',
              text: "Error adding, please try again",
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          });
      });

      $("#lead_checkbox").change(function () {
        if ($(this).prop("checked")) {
          $(".rd-email").val($("#lead_input").val());
        } else {
          $(".rd-email").val("");
        }
      });

      // $('#raindrops_table_body').html('');

      // console.log('raindrops:');
      // console.log(raindropsarray);
      // console.log(content.find(element => element == 'raindrops'));

      let myTable = $("#main").DataTable({
        columnDefs: [
          {
            orderable: false,
            // className: "select-checkbox",
            targets: 0,
          },
        ],
        select: {
          style: "multi", // 'single', 'multi', 'os', 'multi+shift'
          selector: "td:first-child",
        },
        order: [[1, "asc"]],
        searching: false,

        lengthChange: false,

        language: {
          searchPlaceholder: "Search for a contact",
        },

        // "scrollX": true,
        // "scrollY": false,

        paging: false,
        ordering: false,
        info: false,

        // "oLanguage": {
        //  "sSearch": '<a class="btn searchBtn" id="searchBtn"><i class="fa fa-search"></i></a>',
        // },

        dom: "Bfrtip",
        buttons: [
          {
            text: "Create contact",
            className: "btn create-contact-btn",
          },
        ],
      });

      function tableformatter(name) {
        $("#raindrops_table_body").html(``);
        $("#raindrops_table_body").empty();
        myTable.clear();
        myTable.destroy();
        // myTable.empty();

        if (name == "Raindrops") {
          $("#raindrops_table_head").html(`<tr>
                <th>User</th>
                <th>Specs</th>
                <th>Type</th>
                <th>Disk Utilization</th>
                <th>Role</th>
                <th>Last Connected</th>
                <th>Last Connection</th>
            </tr> `);
          raindropsarray.forEach((element) => {
            $("#raindrops_table_body").append(`<tr data-item="${element["item_id"]}" onclick="$('#detailModal').modal('show'); findAndAssignData('${element["item_id"]}');">
                                
                                <td>
                                    
                                    <span class="e-name">
                                        ${element["user"]}
                                    </span>
                                </td>
                                <td>
                                    CPU: ${element["cpu_cores"]} Cores<br>RAM: ${element["RAM"]
              } GB<br>OS: ${element["os_type"]}
                                </td>
                                <td>
                                    ${element["raindrop_type"]}
                                </td>
                                <td>
                                    ${element["disk_utilization"]}
                                </td>
                                <td>
                                    ${element["role"]}
                                </td>
                                <td>
                                    ${timeConverter(element["last_connected"])}
                                </td>
                                <td>
                                    ${element["last_location"]}
                                </td>
                            </tr>
                        `);
          });
        }
        if (name == "Pending Upgrades") {
          $("#raindrops_table_head").html(`<tr>
                        <th>User</th>
                        <th>Specs</th>
                        <th>Type</th>
                        <th>Disk Utilization</th>
                        <th>Role</th>
                        <th>Last Connected</th>
                        <th>Last Connection</th>
                    </tr> `);
          pendingupgradearray.forEach((element) => {
            console.log(element)

            $("#raindrops_table_body").append(`
            <tr>
                    
                    <td>
                        
                        <span class="e-name">
                            ${element["user"]}
                        </span>
                    </td>
                    <td>
                        CPU: ${element["cpu_cores"]}, RAM: ${element["RAM"]
              }, OS: ${element["os"]}
                    </td>
                    <td>
                        ${element["type"]}
                    </td>
                    <td>
                        ${element["disk_utilization"]}
                    </td>
                    <td>
                        ${element["role"]}
                    </td>
                    <td>
                        ${timeConverter(element["last_connected"])}
                    </td>
                    <td>
                        ${element["last_location"]}
                    </td>
                </tr>
            `);
          });
        }

        if (name == "Roles") {

          $("#raindrops_table_head").html(`<tr>
            <th>Company</th>
            <th>Name</th>
            <th>Remove</th>
        </tr> `);

          companiesarray.forEach((company) => {
            let roles = "";
            let buildingg = "";
            let departmentt = "";
            let teamm = "";

            company.buildings?.forEach((building) => {
              building.departments?.forEach((department) => {
                department.teams?.forEach((team) => {
                  team.raindrops?.forEach((raindrop) => {

                    buildingg += building.item_name;
                    departmentt += department.item_name;
                    teamm += team.item_name;
                    roles += raindrop.role;
                  });
                });
              });
            });


            // Only append the row if there are roles
            if (roles) {
              $("#raindrops_table_body").append(`
                    <tr>
                        
                        <td>
                            
                            <span class="e-name">
                            ${company.item_name}
                            </span>
                        </td>
                        
                        <td>
                            ${roles}
                        </td>
                        <td>
                            <div class="delete" style="margin-left: unset;" onclick="$('#removeroleModal${company.item_name}').modal('show')">
                                        <a href="#">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="35"
                                                height="35" viewBox="0 0 35 35">
                                                <g id="Group_7038" data-name="Group 7038"
                                                    transform="translate(-1670 -949)">
                                                    <g id="Path_2516" data-name="Path 2516"
                                                        transform="translate(1670 949)"
                                                        fill="rgba(253,177,40,0.06)">
                                                        <path
                                                            d="M 30 34.5 L 5 34.5 C 2.51869010925293 34.5 0.5 32.4813117980957 0.5 30 L 0.5 5 C 0.5 2.51869010925293 2.51869010925293 0.5 5 0.5 L 30 0.5 C 32.4813117980957 0.5 34.5 2.51869010925293 34.5 5 L 34.5 30 C 34.5 32.4813117980957 32.4813117980957 34.5 30 34.5 Z"
                                                            stroke="none" />
                                                        <path
                                                            d="M 5 1 C 2.794391632080078 1 1 2.794391632080078 1 5 L 1 30 C 1 32.20560836791992 2.794391632080078 34 5 34 L 30 34 C 32.20560836791992 34 34 32.20560836791992 34 30 L 34 5 C 34 2.794391632080078 32.20560836791992 1 30 1 L 5 1 M 5 0 L 30 0 C 32.76142120361328 0 35 2.238571166992188 35 5 L 35 30 C 35 32.76142120361328 32.76142120361328 35 30 35 L 5 35 C 2.238571166992188 35 0 32.76142120361328 0 30 L 0 5 C 0 2.238571166992188 2.238571166992188 0 5 0 Z"
                                                            stroke="none" fill="#fdb128" />
                                                    </g>
                                                    <g id="trash_1_" data-name="trash (1)"
                                                        transform="translate(1678.213 957.756)">
                                                        <path id="Path_2516-2" data-name="Path 2516"
                                                            d="M15.845,2.915H13.586A3.65,3.65,0,0,0,10.015,0H8.558A3.65,3.65,0,0,0,4.988,2.915H2.729a.729.729,0,1,0,0,1.457h.729v9.473A3.648,3.648,0,0,0,7.1,17.488h4.372a3.648,3.648,0,0,0,3.643-3.643V4.372h.729a.729.729,0,1,0,0-1.457ZM8.558,1.457h1.457a2.19,2.19,0,0,1,2.061,1.457H6.5A2.19,2.19,0,0,1,8.558,1.457Zm5.1,12.388a2.186,2.186,0,0,1-2.186,2.186H7.1a2.186,2.186,0,0,1-2.186-2.186V4.372h8.744Z"
                                                            fill="#fdb128" />
                                                        <path id="Path_2517" data-name="Path 2517"
                                                            d="M9.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,0,0-1.457,0V15.1A.729.729,0,0,0,9.729,15.829Z"
                                                            transform="translate(-1.899 -2.713)"
                                                            fill="#fdb128" />
                                                        <path id="Path_2518" data-name="Path 2518"
                                                            d="M13.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,1,0-1.457,0V15.1A.729.729,0,0,0,13.729,15.829Z"
                                                            transform="translate(-2.985 -2.713)"
                                                            fill="#fdb128" />
                                                    </g>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div class="modal fade" id="removeroleModal${company.item_name}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered" style="width: 50%;">
				<div class="modal-content">
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
						<svg xmlns="http://www.w3.org/2000/svg" width="18.185" height="18.185" viewBox="0 0 18.185 18.185">
							<g id="Group_7174" data-name="Group 7174" transform="translate(-616.575 426.915) rotate(-45)">
								<path id="Path_32" data-name="Path 32" d="M18,7.5V27.217" transform="translate(719.859 129.61)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
								<path id="Path_33" data-name="Path 33" d="M7.5,18H27.217" transform="translate(720.5 128.969)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
							</g>
						</svg>
					</button>
					<div class="modal-body">
						<h2 style="color: #fff;">Are you sure?</h2>
						<div class="tab-content" id="myTabContent" style="margin-top: 50px;">
						<h2 style="font-weight: 100; color: #0dcaf0; font-size: 150%; border: none;">
							NOTE: After removing this role, it will no longer be available to replicate.  Existing RainDrops which have been created with this role will remain unchanged.
						</h2>
						<br>
					</div>
						<br>
						<div style="display: flex; align-items: center; justify-content: flex-end; padding-left: 15px;">
							<div class="form-group">
								<button id="${company.item_name}" class="btn btn-delete delete_company_button" onclick="removeRole();">DELETE ROLE</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
                        </td>
                    </tr>
                `);
            }
          });

        }

        if (name == "Departments") {
          $("#raindrops_table_head").html(`<tr>
                <th>Name</th>
                <th>Admin</th>
                <th>Remove</th>
            </tr> `);
          departmentsarray.forEach((element) => {
            $("#raindrops_table_body").append(`
            <tr>

                    <td>
                        
                        <span class="e-name">
                            ${element["item_name"]}
                        </span>
                    </td>
                    <td>
                        ${element["admins"]}
                    </td>
                    <td>
                            <div class="delete" style="margin-left: unset;" onclick="$('#removedepartmentModal${element["item_id"]}').modal('show')">
                                        <a href="#">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="35"
                                                height="35" viewBox="0 0 35 35">
                                                <g id="Group_7038" data-name="Group 7038"
                                                    transform="translate(-1670 -949)">
                                                    <g id="Path_2516" data-name="Path 2516"
                                                        transform="translate(1670 949)"
                                                        fill="rgba(253,177,40,0.06)">
                                                        <path
                                                            d="M 30 34.5 L 5 34.5 C 2.51869010925293 34.5 0.5 32.4813117980957 0.5 30 L 0.5 5 C 0.5 2.51869010925293 2.51869010925293 0.5 5 0.5 L 30 0.5 C 32.4813117980957 0.5 34.5 2.51869010925293 34.5 5 L 34.5 30 C 34.5 32.4813117980957 32.4813117980957 34.5 30 34.5 Z"
                                                            stroke="none" />
                                                        <path
                                                            d="M 5 1 C 2.794391632080078 1 1 2.794391632080078 1 5 L 1 30 C 1 32.20560836791992 2.794391632080078 34 5 34 L 30 34 C 32.20560836791992 34 34 32.20560836791992 34 30 L 34 5 C 34 2.794391632080078 32.20560836791992 1 30 1 L 5 1 M 5 0 L 30 0 C 32.76142120361328 0 35 2.238571166992188 35 5 L 35 30 C 35 32.76142120361328 32.76142120361328 35 30 35 L 5 35 C 2.238571166992188 35 0 32.76142120361328 0 30 L 0 5 C 0 2.238571166992188 2.238571166992188 0 5 0 Z"
                                                            stroke="none" fill="#fdb128" />
                                                    </g>
                                                    <g id="trash_1_" data-name="trash (1)"
                                                        transform="translate(1678.213 957.756)">
                                                        <path id="Path_2516-2" data-name="Path 2516"
                                                            d="M15.845,2.915H13.586A3.65,3.65,0,0,0,10.015,0H8.558A3.65,3.65,0,0,0,4.988,2.915H2.729a.729.729,0,1,0,0,1.457h.729v9.473A3.648,3.648,0,0,0,7.1,17.488h4.372a3.648,3.648,0,0,0,3.643-3.643V4.372h.729a.729.729,0,1,0,0-1.457ZM8.558,1.457h1.457a2.19,2.19,0,0,1,2.061,1.457H6.5A2.19,2.19,0,0,1,8.558,1.457Zm5.1,12.388a2.186,2.186,0,0,1-2.186,2.186H7.1a2.186,2.186,0,0,1-2.186-2.186V4.372h8.744Z"
                                                            fill="#fdb128" />
                                                        <path id="Path_2517" data-name="Path 2517"
                                                            d="M9.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,0,0-1.457,0V15.1A.729.729,0,0,0,9.729,15.829Z"
                                                            transform="translate(-1.899 -2.713)"
                                                            fill="#fdb128" />
                                                        <path id="Path_2518" data-name="Path 2518"
                                                            d="M13.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,1,0-1.457,0V15.1A.729.729,0,0,0,13.729,15.829Z"
                                                            transform="translate(-2.985 -2.713)"
                                                            fill="#fdb128" />
                                                    </g>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div class="modal fade" id="removedepartmentModal${element["item_id"]}" tabindex="-1" aria-labelledby="exampleModalLabel" style="display: none;" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered" style="width: 50%;">
				<div class="modal-content">
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
						<svg xmlns="http://www.w3.org/2000/svg" width="18.185" height="18.185" viewBox="0 0 18.185 18.185">
							<g id="Group_7174" data-name="Group 7174" transform="translate(-616.575 426.915) rotate(-45)">
								<path id="Path_32" data-name="Path 32" d="M18,7.5V27.217" transform="translate(719.859 129.61)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
								<path id="Path_33" data-name="Path 33" d="M7.5,18H27.217" transform="translate(720.5 128.969)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
							</g>
						</svg>
					</button>
					<div class="modal-body">
						<h2 style="color: #fff;">Are you sure?</h2>
						<div class="tab-content" id="myTabContent" style="margin-top: 50px;">
						<h2 style="font-weight: 100; color: #0dcaf0; font-size: 150%; border: none;">
							WARNING: THIS WILL DESTROY ALL RAINDROPS AND THEIR DATA UNDER THIS DEPARTMENT, ALONG WITH ALL TEAMS.  THIS SHOULD ONLY BE DONE IF YOU HAVE ALREADY BACKED UP ALL YOUR DATA FOR THESE RAINDROPS.  THE POTENTIAL FOR PERMANENT DATA LOSS IS HIGH, PLEASE BE VERY SURE OF THIS ACTION BEFORE PROCEEDING!
						</h2>
						<br>
					</div>
						<br>
						<div style="display: flex; align-items: center; justify-content: flex-end; padding-left: 15px;">
							<div class="form-group">
								<button id="${element["item_id"]}" class="btn btn-delete delete_company_button" onclick="removeDepartment('${element["item_id"]}','${element["outbound_ip"]}');">DELETE DEPARTMENT</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
                        </td>
                </tr>
            `);
          });
        }
        if (name == "Teams") {
          $("#raindrops_table_head").html(`<tr>
                <th>Name</th>
                <th>Admin</th>
                <th>Remove</th>
            </tr> `);
          teamsarray.forEach((element) => {
            $("#raindrops_table_body").append(`
            <tr>
                    
                    <td>
                        
                        <span class="e-name">
                            ${element["item_name"]}
                        </span>
                    </td>
                    <td>
                        ${element["admins"]}
                    </td>
                    <td>
                            <div class="delete" style="margin-left: unset;" onclick="$('#removeteamModal${element["item_id"]}').modal('show')">
                                        <a href="#">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="35"
                                                height="35" viewBox="0 0 35 35">
                                                <g id="Group_7038" data-name="Group 7038"
                                                    transform="translate(-1670 -949)">
                                                    <g id="Path_2516" data-name="Path 2516"
                                                        transform="translate(1670 949)"
                                                        fill="rgba(253,177,40,0.06)">
                                                        <path
                                                            d="M 30 34.5 L 5 34.5 C 2.51869010925293 34.5 0.5 32.4813117980957 0.5 30 L 0.5 5 C 0.5 2.51869010925293 2.51869010925293 0.5 5 0.5 L 30 0.5 C 32.4813117980957 0.5 34.5 2.51869010925293 34.5 5 L 34.5 30 C 34.5 32.4813117980957 32.4813117980957 34.5 30 34.5 Z"
                                                            stroke="none" />
                                                        <path
                                                            d="M 5 1 C 2.794391632080078 1 1 2.794391632080078 1 5 L 1 30 C 1 32.20560836791992 2.794391632080078 34 5 34 L 30 34 C 32.20560836791992 34 34 32.20560836791992 34 30 L 34 5 C 34 2.794391632080078 32.20560836791992 1 30 1 L 5 1 M 5 0 L 30 0 C 32.76142120361328 0 35 2.238571166992188 35 5 L 35 30 C 35 32.76142120361328 32.76142120361328 35 30 35 L 5 35 C 2.238571166992188 35 0 32.76142120361328 0 30 L 0 5 C 0 2.238571166992188 2.238571166992188 0 5 0 Z"
                                                            stroke="none" fill="#fdb128" />
                                                    </g>
                                                    <g id="trash_1_" data-name="trash (1)"
                                                        transform="translate(1678.213 957.756)">
                                                        <path id="Path_2516-2" data-name="Path 2516"
                                                            d="M15.845,2.915H13.586A3.65,3.65,0,0,0,10.015,0H8.558A3.65,3.65,0,0,0,4.988,2.915H2.729a.729.729,0,1,0,0,1.457h.729v9.473A3.648,3.648,0,0,0,7.1,17.488h4.372a3.648,3.648,0,0,0,3.643-3.643V4.372h.729a.729.729,0,1,0,0-1.457ZM8.558,1.457h1.457a2.19,2.19,0,0,1,2.061,1.457H6.5A2.19,2.19,0,0,1,8.558,1.457Zm5.1,12.388a2.186,2.186,0,0,1-2.186,2.186H7.1a2.186,2.186,0,0,1-2.186-2.186V4.372h8.744Z"
                                                            fill="#fdb128" />
                                                        <path id="Path_2517" data-name="Path 2517"
                                                            d="M9.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,0,0-1.457,0V15.1A.729.729,0,0,0,9.729,15.829Z"
                                                            transform="translate(-1.899 -2.713)"
                                                            fill="#fdb128" />
                                                        <path id="Path_2518" data-name="Path 2518"
                                                            d="M13.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,1,0-1.457,0V15.1A.729.729,0,0,0,13.729,15.829Z"
                                                            transform="translate(-2.985 -2.713)"
                                                            fill="#fdb128" />
                                                    </g>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div class="modal fade" id="removeteamModal${element["item_id"]}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered" style="width: 50%;">
				<div class="modal-content">
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
						<svg xmlns="http://www.w3.org/2000/svg" width="18.185" height="18.185" viewBox="0 0 18.185 18.185">
							<g id="Group_7174" data-name="Group 7174" transform="translate(-616.575 426.915) rotate(-45)">
								<path id="Path_32" data-name="Path 32" d="M18,7.5V27.217" transform="translate(719.859 129.61)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
								<path id="Path_33" data-name="Path 33" d="M7.5,18H27.217" transform="translate(720.5 128.969)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
							</g>
						</svg>
					</button>
					<div class="modal-body">
						<h2 style="color: #fff;">Are you sure?</h2>
						<div class="tab-content" id="myTabContent" style="margin-top: 50px;">
						<h2 style="font-weight: 100; color: #0dcaf0; font-size: 150%; border: none;">
							WARNING: THIS WILL DESTROY ALL RAINDROPS AND THEIR DATA UNDER THIS TEAM.  THIS SHOULD ONLY BE DONE IF YOU HAVE ALREADY BACKED UP ALL YOUR DATA FOR THESE RAINDROPS.  THE POTENTIAL FOR PERMANENT DATA LOSS IS HIGH, PLEASE BE VERY SURE OF THIS ACTION BEFORE PROCEEDING!
						</h2>
						<br>
					</div>
						<br>
						<div style="display: flex; align-items: center; justify-content: flex-end; padding-left: 15px;">
							<div class="form-group">
								<button id="${element["item_id"]}" class="btn btn-delete delete_company_button" onclick="removeTeam('${element["item_id"]}','${element["outbound_ip"]}');">DELETE TEAM</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
                        </td>
                </tr>
            `);
          });
        }
        if (name == "Buildings") {
          $("#raindrops_table_head").html(`<tr>
                <th>Name</th>
                <th>Admin</th>
                <th>building_ip</th>
                <th>Remove</th>
            </tr> `);
          buildingsarray.forEach((element) => {
            $("#raindrops_table_body").append(`
            <tr>
                    
                    <td>
                        
                        <span class="e-name">
                            ${element["item_name"]}
                        </span>
                    </td>
                    <td>
                        ${element["admins"]}
                    </td>
                    <td>
                        ${element["building_ip"]}
                    </td>
                    <td>
                            <div class="delete" style="margin-left: unset;" onclick="$('#removebuildingModal${element["item_id"]}').modal('show')">
                                        <a href="#">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="35"
                                                height="35" viewBox="0 0 35 35">
                                                <g id="Group_7038" data-name="Group 7038"
                                                    transform="translate(-1670 -949)">
                                                    <g id="Path_2516" data-name="Path 2516"
                                                        transform="translate(1670 949)"
                                                        fill="rgba(253,177,40,0.06)">
                                                        <path
                                                            d="M 30 34.5 L 5 34.5 C 2.51869010925293 34.5 0.5 32.4813117980957 0.5 30 L 0.5 5 C 0.5 2.51869010925293 2.51869010925293 0.5 5 0.5 L 30 0.5 C 32.4813117980957 0.5 34.5 2.51869010925293 34.5 5 L 34.5 30 C 34.5 32.4813117980957 32.4813117980957 34.5 30 34.5 Z"
                                                            stroke="none" />
                                                        <path
                                                            d="M 5 1 C 2.794391632080078 1 1 2.794391632080078 1 5 L 1 30 C 1 32.20560836791992 2.794391632080078 34 5 34 L 30 34 C 32.20560836791992 34 34 32.20560836791992 34 30 L 34 5 C 34 2.794391632080078 32.20560836791992 1 30 1 L 5 1 M 5 0 L 30 0 C 32.76142120361328 0 35 2.238571166992188 35 5 L 35 30 C 35 32.76142120361328 32.76142120361328 35 30 35 L 5 35 C 2.238571166992188 35 0 32.76142120361328 0 30 L 0 5 C 0 2.238571166992188 2.238571166992188 0 5 0 Z"
                                                            stroke="none" fill="#fdb128" />
                                                    </g>
                                                    <g id="trash_1_" data-name="trash (1)"
                                                        transform="translate(1678.213 957.756)">
                                                        <path id="Path_2516-2" data-name="Path 2516"
                                                            d="M15.845,2.915H13.586A3.65,3.65,0,0,0,10.015,0H8.558A3.65,3.65,0,0,0,4.988,2.915H2.729a.729.729,0,1,0,0,1.457h.729v9.473A3.648,3.648,0,0,0,7.1,17.488h4.372a3.648,3.648,0,0,0,3.643-3.643V4.372h.729a.729.729,0,1,0,0-1.457ZM8.558,1.457h1.457a2.19,2.19,0,0,1,2.061,1.457H6.5A2.19,2.19,0,0,1,8.558,1.457Zm5.1,12.388a2.186,2.186,0,0,1-2.186,2.186H7.1a2.186,2.186,0,0,1-2.186-2.186V4.372h8.744Z"
                                                            fill="#fdb128" />
                                                        <path id="Path_2517" data-name="Path 2517"
                                                            d="M9.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,0,0-1.457,0V15.1A.729.729,0,0,0,9.729,15.829Z"
                                                            transform="translate(-1.899 -2.713)"
                                                            fill="#fdb128" />
                                                        <path id="Path_2518" data-name="Path 2518"
                                                            d="M13.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,1,0-1.457,0V15.1A.729.729,0,0,0,13.729,15.829Z"
                                                            transform="translate(-2.985 -2.713)"
                                                            fill="#fdb128" />
                                                    </g>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div class="modal fade" id="removebuildingModal${element["item_id"]}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered" style="width: 50%;">
				<div class="modal-content">
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
						<svg xmlns="http://www.w3.org/2000/svg" width="18.185" height="18.185" viewBox="0 0 18.185 18.185">
							<g id="Group_7174" data-name="Group 7174" transform="translate(-616.575 426.915) rotate(-45)">
								<path id="Path_32" data-name="Path 32" d="M18,7.5V27.217" transform="translate(719.859 129.61)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
								<path id="Path_33" data-name="Path 33" d="M7.5,18H27.217" transform="translate(720.5 128.969)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
							</g>
						</svg>
					</button>
					<div class="modal-body">
						<h2 style="color: #fff;">Are you sure?</h2>
						<div class="tab-content" id="myTabContent" style="margin-top: 50px;">
						<h2 style="font-weight: 100; color: #0dcaf0; font-size: 150%; border: none;">
							WARNING: THIS WILL DESTROY ALL RAINDROPS AND THEIR DATA UNDER THIS BUILDING, ALONG WITH ALL DEPARTMENTS and TEAMS.  THIS SHOULD ONLY BE DONE IF YOU HAVE ALREADY BACKED UP ALL YOUR DATA FOR THESE RAINDROPS.  THE POTENTIAL FOR PERMANENT DATA LOSS IS HIGH, PLEASE BE VERY SURE OF THIS ACTION BEFORE PROCEEDING!
						</h2>
						<br>
					</div>
						<br>
						<div style="display: flex; align-items: center; justify-content: flex-end; padding-left: 15px;">
							<div class="form-group">
                                    <button id="${element["item_id"]}" class="btn btn-delete delete_company_button" onclick="removeBuilding('${element["item_id"]}','${element["outbound_ip"]}');">DELETE BUILDING</button>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                        </td>
                </tr>
            `);
          });
        }
        if (name == "Companies") {
          $("#raindrops_table_head").html(`<tr>
                        <th>Name</th>
                        <th>Admin</th>
                        <th>Outbound_Ip</th>
                        <th>Remove</th>
                    </tr>`);
          companiesarray.forEach((element) => {
            console.log(element)

            $("#raindrops_table_body").append(`
            <tr>
                    
                    <td>
                        
                        <span class="e-name">
                            ${element["item_name"]}
                        </span>
                    </td>
                    <td>
                        ${element["admins"]}
                    </td>
                    <td>
                        ${element["outbound_ip"]}
                    </td>
                    <td>
                            <div class="delete" style="margin-left: unset;" onclick="$('#removecompanyModal${element["item_id"]}').modal('show')">
                                        <a href="#">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="35"
                                                height="35" viewBox="0 0 35 35">
                                                <g id="Group_7038" data-name="Group 7038"
                                                    transform="translate(-1670 -949)">
                                                    <g id="Path_2516" data-name="Path 2516"
                                                        transform="translate(1670 949)"
                                                        fill="rgba(253,177,40,0.06)">
                                                        <path
                                                            d="M 30 34.5 L 5 34.5 C 2.51869010925293 34.5 0.5 32.4813117980957 0.5 30 L 0.5 5 C 0.5 2.51869010925293 2.51869010925293 0.5 5 0.5 L 30 0.5 C 32.4813117980957 0.5 34.5 2.51869010925293 34.5 5 L 34.5 30 C 34.5 32.4813117980957 32.4813117980957 34.5 30 34.5 Z"
                                                            stroke="none" />
                                                        <path
                                                            d="M 5 1 C 2.794391632080078 1 1 2.794391632080078 1 5 L 1 30 C 1 32.20560836791992 2.794391632080078 34 5 34 L 30 34 C 32.20560836791992 34 34 32.20560836791992 34 30 L 34 5 C 34 2.794391632080078 32.20560836791992 1 30 1 L 5 1 M 5 0 L 30 0 C 32.76142120361328 0 35 2.238571166992188 35 5 L 35 30 C 35 32.76142120361328 32.76142120361328 35 30 35 L 5 35 C 2.238571166992188 35 0 32.76142120361328 0 30 L 0 5 C 0 2.238571166992188 2.238571166992188 0 5 0 Z"
                                                            stroke="none" fill="#fdb128" />
                                                    </g>
                                                    <g id="trash_1_" data-name="trash (1)"
                                                        transform="translate(1678.213 957.756)">
                                                        <path id="Path_2516-2" data-name="Path 2516"
                                                            d="M15.845,2.915H13.586A3.65,3.65,0,0,0,10.015,0H8.558A3.65,3.65,0,0,0,4.988,2.915H2.729a.729.729,0,1,0,0,1.457h.729v9.473A3.648,3.648,0,0,0,7.1,17.488h4.372a3.648,3.648,0,0,0,3.643-3.643V4.372h.729a.729.729,0,1,0,0-1.457ZM8.558,1.457h1.457a2.19,2.19,0,0,1,2.061,1.457H6.5A2.19,2.19,0,0,1,8.558,1.457Zm5.1,12.388a2.186,2.186,0,0,1-2.186,2.186H7.1a2.186,2.186,0,0,1-2.186-2.186V4.372h8.744Z"
                                                            fill="#fdb128" />
                                                        <path id="Path_2517" data-name="Path 2517"
                                                            d="M9.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,0,0-1.457,0V15.1A.729.729,0,0,0,9.729,15.829Z"
                                                            transform="translate(-1.899 -2.713)"
                                                            fill="#fdb128" />
                                                        <path id="Path_2518" data-name="Path 2518"
                                                            d="M13.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,1,0-1.457,0V15.1A.729.729,0,0,0,13.729,15.829Z"
                                                            transform="translate(-2.985 -2.713)"
                                                            fill="#fdb128" />
                                                    </g>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>

                                    <div class="modal fade" id="removecompanyModal${element["item_id"]}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div class="modal-dialog modal-dialog-centered" style="width: 50%;">
                                    <div class="modal-content">
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18.185" height="18.185" viewBox="0 0 18.185 18.185">
                                    <g id="Group_7174" data-name="Group 7174" transform="translate(-616.575 426.915) rotate(-45)">
                                    <path id="Path_32" data-name="Path 32" d="M18,7.5V27.217" transform="translate(719.859 129.61)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
                                    <path id="Path_33" data-name="Path 33" d="M7.5,18H27.217" transform="translate(720.5 128.969)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
                                    </g>
                                    </svg>
                                    </button>
                                    <div class="modal-body">
                                    <h2 style="color: #fff;">Are you sure?</h2>
                                    <div class="tab-content" id="myTabContent" style="margin-top: 50px;">
                                    <h2 style="font-weight: 100; color: #0dcaf0; font-size: 150%; border: none;">
                                    WARNING: THIS WILL DESTROY ALL RAINDROPS AND THEIR DATA UNDER THIS COMPANY, ALONG WITH ALL BUILDINGS, DEPARTMENTS AND TEAMS.  THIS SHOULD ONLY BE DONE IF YOU HAVE ALREADY BACKED UP ALL YOUR DATA FOR THESE RAINDROPS.  THE POTENTIAL FOR PERMANENT DATA LOSS IS HIGH, PLEASE BE VERY SURE OF THIS ACTION BEFORE PROCEEDING!
                                    </h2>
                                    <br>
                                    </div>
                                    <br>
                                    <div style="display: flex; align-items: center; justify-content: flex-end; padding-left: 15px;">
                                    <div class="form-group">
                                    <button id="${element["item_id"]}" class="btn btn-delete delete_company_button" onclick="removeCompany('${element["item_id"]}','${element["outbound_ip"]}');">DELETE COMPANY</button>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                        </td>
                </tr>
            `);
          });
        }

        myTable = $("#main").DataTable({
          columnDefs: [
            {
              orderable: false,
              // className: "select-checkbox",
              targets: 0,
            },
          ],
          select: {
            style: "multi", // 'single', 'multi', 'os', 'multi+shift'
            selector: "td:first-child",
          },
          order: [[1, "asc"]],
          searching: false,

          lengthChange: false,

          language: {
            searchPlaceholder: "Search for a contact",
          },

          // "scrollX": true,
          // "scrollY": false,

          paging: false,
          ordering: false,
          info: false,

          // "oLanguage": {
          //  "sSearch": '<a class="btn searchBtn" id="searchBtn"><i class="fa fa-search"></i></a>',
          // },

          dom: "Bfrtip",
          buttons: [
            {
              text: "Create contact",
              className: "btn create-contact-btn",
            },
          ],
        });
      }

      $("#MyTableCheckAllButton").click(function () {
        if (
          myTable
            .rows({
              selected: true,
            })
            .count() > 0
        ) {
          myTable.rows().deselect();
          return;
        }

        myTable.rows().select();
      });

      myTable.on("select deselect", function (e, dt, type, indexes) {
        if (type === "row") {
          // We may use dt instead of myTable to have the freshest data.
          if (
            dt.rows().count() ===
            dt
              .rows({
                selected: true,
              })
              .count()
          ) {
            // Deselect all items button.
            $("#MyTableCheckAllButton span").attr("class", "check checkall");
            return;
          }

          if (
            dt
              .rows({
                selected: true,
              })
              .count() === 0
          ) {
            // Select all items button.
            $("#MyTableCheckAllButton span").attr("class", "icon");
            return;
          }

          // Deselect some items button.
          $("#MyTableCheckAllButton span").attr("class", "minus checkall");
        }
      });

      $("#example tbody").on("click", ".btn-delete", function () {
        myTable.row($(this).parents("tr")).remove().draw();

      });

      try {
        tableformatter("Raindrops");
      } catch (error) {
        console.log(error);
      }

      function createCharts(max) {
        max_days = max;

        let create_series = [
          {
            data: [],
            type: "line",
            smooth: true,
            areaStyle: {},
            name: "Connections",
          },
          {
            data: [],
            type: "line",
            smooth: true,
            areaStyle: {},
            name: "Upgrades",
          },
          {
            data: [],
            type: "line",
            smooth: true,
            areaStyle: {},
            name: "Reboots",
          },
        ];

        var dom = document.getElementById("chart-container");

        var myChart = echarts.init(dom, {
          renderer: "svg",
          useDirtyRect: false,
        });

        var dom2 = document.getElementById("chart-container-modal");

        var myChart2 = echarts.init(dom2, {
          renderer: "svg",
          useDirtyRect: false,
        });

        var app = {};

        var option;

        option = {
          darkMode: true,
          // backgroundColor: ['#232C3B'],
          darkMode: "auto",

          title: {
            text: "Activity",
            textStyle: {
              color: "#b3b9e2",
            },
          },

          legend: {
            orient: "horizontal",
            align: "right",
            verticalAlign: "top",
            y: 10,
            padding: 3,
            itemMarginTop: 5,
            itemMarginBottom: 5,
            itemStyle: {
              lineHeight: "1px",
            },
            textStyle: {
              color: "#b3b9e2",
            },
          },
          color: [
            'rgba(94, 135, 247, 0.7)',
            'rgba(27, 255, 225, 0.7)',
            'rgba(246, 137, 42, 0.7)',
          ],
          // color: ['#8768F1', '#FDB128', '#FB268A'],

          grid: {
            top: "15%",
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            // data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
          },
          yAxis: {
            type: "value",
            axisLabel: {
              formatter: "{value}",
            },
            splitLine: { show: false },
          },
          series: create_series,
        };
        create_series[0]["data"] = [];
        create_series[1]["data"] = [];
        create_series[2]["data"] = [];
        i = 0;
        content["activity"]["connections"].forEach((element) => {
          if (i <= max_days) {
            create_series[0]["data"].unshift(element);
          }
          i++;
        });

        i = 0;
        content["activity"]["upgrades"].forEach((element) => {
          if (i <= max_days) {
            create_series[1]["data"].unshift(element);
          }
          i++;
        });

        i = 0;
        content["activity"]["reboots"].forEach((element) => {
          if (i <= max_days) {
            create_series[2]["data"].unshift(element);
          }
          i++;
        });

        myChart.setOption(option);
        myChart2.setOption(option);
        window.addEventListener("resize", myChart.resize);

        $("#last_days_pick").text(max_days);

        // alert('create');
      }

      $("#chart_1_3").change(function () {
        createCharts($(this).val());
      });

      $("#upgrade_chart").change(function () {
        updateChart(rainDropChart, $(this).val());

      });

      createCharts(30);

      $("#ewaste_prevented").text(
        content["environmental_detail"]["ewaste_prevented"]
      );
      $("#electricity_saved").text(
        content["environmental_detail"]["electricity_saved"]
      );

    });
  });




  // ------------- FORM FUNCTIONALITY

  // $(document).ready(function () {
  //   $('#add_company').on('submit', function (e) {
  //     e.preventDefault();
  //     var company_name = $('#company_name').val();

  //     $.ajax({
  //       url: base_url + "/management",
  //       type: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${access_token}`,
  //       },
  //       contentType: 'application/json',
  //       data: JSON.stringify({
  //         "query": "addcompany",
  //         "name": company_name
  //       }),
  //       success: function (response) {
  //         //Do something with the response
  //         console.log(response);
  //       },
  //       error: function (error) {
  //         //Handle error
  //         console.log(error);
  //       }
  //     });
  //   });
  // });

  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  })

  // invite admin
  $(".invite-admin").click(function () {
    // item_id = $("#item_name").val();
    // email = $("#invite_email");
    // first_name = $("#invite_first_name");
    // last_name = $("#invite_last_name");
    invite_admin_data = `{
    "query":"inviteadmin",
    "item_id": "${("#invite_admin_item").val()}",
    "account_id": "${userInfo["account_id"]}",
    "email": "${("#invite_email")}",
    "first_name": "${("#invite_first_name")}",
    "last_name": "${("#invite_last_name")}",
  }`;
    // console.log(datacompany);
    submitbutton = $(this);
    savetext = $(this).html();
    $(this)
      .prop("disabled", true)
      .html(
        `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
      );

    $.ajax({
      url: base_url + "/management",
      type: "POST",
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
      dataType: "text",
      data: invite_admin_data,
    })
      .done(function (response) {
        result = JSON.parse(response);
        submitbutton.html(savetext).prop("disabled", false);
        Swal.fire({
          title: 'Done',
          text: "Admin " + $("#invite_email") + " invited",
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading()
          },
          didClose: () => {
            Swal.hideLoading();
            window.location.reload(true);
          }
        });
      })
      .fail(function () {
        submitbutton.html(savetext).prop("disabled", false);
        Swal.fire({
          title: 'Error',
          text: "Error adding, please try again",
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      });
  });


});
