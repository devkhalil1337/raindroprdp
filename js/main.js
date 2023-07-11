const management_url = "https://api.raindroprdp.com/management"
const listings_url = "https://api.raindroprdp.com/listings"
const access_token = 'DBYaHWq4qdZDAVIFF44pQ'

let index = 0;
function numberWithCommas(x) {
  try {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } catch (error) {
    return "no data";
  }
}

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

$(document).ready(function () {
  // $('body').css('opacity', '0.33');
  $.ajax({
    url: "https://api.raindroprdp.com/listings",
    type: "POST",
    dataType: "text",
    data: '{"query":"getuser","email":"test04@raindroprdp.com"}',
  }).done(function (response) {
    userInfo = JSON.parse(response);
    console.log(userInfo);
    $("#user_name").text(userInfo["first_name"] + " " + userInfo["last_name"]);

    //data for profile modal

    $("#profile_first_name").val(userInfo["first_name"]);
    $("#profile_last_name").val(userInfo["last_name"]);
    $("#profile_email").val(userInfo["email"]);

    $("#profile_pils_admin_level").text(userInfo["level"]);
    $("#profile_pils_item_name").text(userInfo["item_name"]);

    $.ajax({
      url: "https://api.raindroprdp.com/listings",
      type: "POST",
      dataType: "text",
      data: '{"query":"getview","item_id":"' + userInfo["item_id"] + '"}',
    }).done(function (response) {
      $("body").css("opacity", "1");
      content = JSON.parse(response);
      console.log(content);

      let pending_upgrades_count = 0;
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
        company_array = content["items"]["companies"];
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
                }
              }
            }
          }
        });
      }

      pendingUpgradesCount();

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

      $("#billing_pils_tier").text(content["pricing"]["tier"]);
      $("#billing_pils_this_month").text(
        numberWithCommas(currency + content["financial_data"]["this_month"])
      );
      $("#billing_pils_last_month").text(
        numberWithCommas(currency + content["financial_data"]["last_month"])
      );

      $("#item_name").text(content["item_name"]);

      function pricechange() {
        montlychange = 0;
        $(".specs-select").each(function () {
          // alert($(this).data('price'));
          montlychange += $(this).find(":selected").data("price");
        });
        $("#montly_change").text(`${currency}${montlychange}`);
      }

      $(".specs-select").html("");
      content["pricing"]["windows"].forEach(function (value, index) {
        $(".specs-select").append(
          `<option value="${value["id"]}">(${value["type"]}) CPU: ${value["cpu"]}, RAM: ${value["ram"]}. ${value["price"]}$</option>`
        );
      });

      $(".add-member").click(function () {
        optionhtml = ``;
        osbydefault = "windows"; // or linux
        content["pricing"][osbydefault].forEach(function (value, index) {
          optionhtml += `<option value="${value["type"]}" data-price="${value["price"]}">(${value["type"]}) CPU: ${value["cpu"]}, RAM: ${value["ram"]}. ${value["price"]}${currency}</option>`;
        });
        oshtml = ``;

        try {
          content["roles"].forEach(function (value, index) {
            oshtml += `<option value="${value["os_type"]}" data-id="${value["id"]}">${value["role_name"]}</option>`;
          });
        } catch (error) {
          console.log(error);
        }

        let memberblock = `<div class="member-block">
                    <div class="row">
                        <div class="col-6 col-sm-6 col-md-4">
                            <div class="form-group">
                                <select class="form-select form-control specs-select"
                                    style="width: 100%; max-width: 100%;">
                                    ${optionhtml}
                                </select>
                            </div>
                        </div>
                        <div class="col-6 col-sm-6 col-md-4">
                            <div class="form-group">
                                <div class="form-group">
                                    <input type="text" class="form-control rd-email"
                                        placeholder="Write the user email">
                                </div>
                            </div>
                        </div>
                        <div class="col-6 col-sm-6 col-md-3">
                            <div class="form-group">
                                <select name="" class="form-select form-control os-select" id=""
                                    style="width: 100%; max-width: 100%;">
                                    ${oshtml}
                                </select>
                            </div>
                        </div>
                        <div class="col-6 col-sm-6 col-md-1">
                            <div class="action" style="display: flex; justify-content: center;">
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
            `<option value="" data-price="${value["price"]}">(${value["type"]}) CPU: ${value["cpu"]}, RAM: ${value["ram"]}. ${value["price"]}${currency}</option>`
          );
        });
        pricechange();
      });

      $(document).on("change", ".specs-select", function () {
        pricechange();
      });

      $(".member-list").on("DOMSubtreeModified", function () {
        // console.log('changed');
        pricechange();
      });

      function getCompanyKey(name) {
        let key = 0;
        content["items"]["companies"].forEach(function (value, index) {
          if (name == value["item_name"]) {
            // console.log(index);
            key = index;
          }
        });

        return key;
      }

      content["items"]["companies"].forEach(function (value, index) {
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
          `<option value="${value["id"]}">${value["item_name"]}</option>`
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

      function rdModalDropdown2(picked_company) {
        $("#rd_modal_details").html(""); // clear dropdown
        picked_company_id = getCompanyKey(picked_company);
        picked_company_array = content["items"]["companies"][picked_company_id];

        // console.log(picked_company_array['buildings']);

        picked_company_array["buildings"].forEach(function (value, index) {
          option_formating = "";
          option_formating = value["item_name"];
          departmentsObj = value["departments"];
          // console.log(departmentsObj);

          for (const [key0, value0] of Object.entries(departmentsObj)) {
            // option_formating = option_formating + ' -> ' + value0['name'];
            teamsObj = value0["teams"];
            // console.log(teamsObj);

            if (teamsObj !== undefined) {
              for (const [key1, value1] of Object.entries(teamsObj)) {
                // option_formating = option_formating + ' -> ' + value0['name'] + ' -> ' + value1['name'];
                $("#rd_modal_details").append(
                  `<option value="${value1["id"]}" data-name="${
                    value1["item_name"]
                  }">${
                    option_formating +
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

      // picked_company = getCompanyKey('company01');
      picked_company = getCompanyKey(content["items"]["companies"][index]);
      picked_company_name = content["items"]["companies"][picked_company];
      $("#dropdown_company_button").text(picked_company_name);

      createDropdown2(picked_company);
      rdModalDropdown2(picked_company);

      $(".company_picker").click(function () {
        company_name = $(this).data("item_name");
        createDropdown2(company_name);
        $("#dropdown_company_button").text(company_name);
        // alert('Company' + company_name + ' picked!');
      });

      $("#rd_modal_company").change(function () {
        // alert($(this).val())
        rdModalDropdown2($(this).val());
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

      function inviteAdminDrop2(picked) {
        $("#invite_admin_2").html("");
        company_array = content["items"]["companies"];

        if (picked == "company") {
          company_array.forEach(function (value, index) {
            // option_formating = value['name'];
            $("#invite_admin_2").append(
              `<option value="">${value["item_name"]}</option>`
            );
          });
        }

        if (picked == "building") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              $("#invite_admin_2").append(
                `<option value="">${
                  option_formating + " -> " + value0["item_name"]
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
                    `<option value="">${
                      option_formating +
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
                        `<option value="">${
                          option_formating +
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
                `<option value="">${
                  option_formating + " -> " + value0["item_name"]
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
                    `<option value="">${
                      option_formating +
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
                        `<option value="">${
                          option_formating +
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
              `<option value="${value["id"]}">${value["item_name"]}</option>`
            );
          });
        }

        if (picked == "building") {
          company_array.forEach(function (value, index) {
            option_formating = value["item_name"];
            buildingsObj = value["buildings"];
            for (const [key0, value0] of Object.entries(buildingsObj)) {
              $(selector_id).append(
                `<option value="${value0["id"]}">${
                  option_formating + " -> " + value0["item_name"]
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
                    `<option value="${value1["id"]}">${
                      option_formating +
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
                        `<option value="${value2["id"]}">${
                          option_formating +
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
        datacompany = `{"query":"addcompany","company_name": "${companyname.val()}","account_id": "${
          userInfo["account_id"]
        }","office_schedule": "${company_office_schedule.val()}"}`;
        // console.log(datacompany);
        submitbutton = $(this);
        savetext = $(this).html();
        $(this)
          .prop("disabled", true)
          .html(
            `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
          );

        $.ajax({
          url: "https://api.raindroprdp.com/management",
          type: "POST",
          dataType: "text",
          data: datacompany,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            $.notify("Company " + companyname.val() + " added successfully", {
              position: "right bottom",
              className: "success",
            });
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            $.notify("Some error", {
              position: "right bottom",
              className: "error",
            });
          });
      });

      companiesarray.forEach(function (value, index) {
        $("#building_company").append(
          `<option value="${value["id"]}">${value["item_name"]}</option>`
        );
      });

      // create building
      $(".create-building").click(function () {
        datacompany = `{
                    "query": "addbuilding",
                    "company_id": "${$("#building_company").val()}",
                    "account_id": "${userInfo["account_id"]}",
                    "building_name": "${$("#building_name").val()}",
                    "building_ip": "${$("#building_ip").val()}",
                    "address1": "${$("#building_address").val()}",
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
          url: "https://api.raindroprdp.com/management",
          type: "POST",
          dataType: "text",
          data: datacompany,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            $.notify(
              "Building " + $("#building_name").val() + " added successfully",
              { position: "right bottom", className: "success" }
            );
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            $.notify("Some error", {
              position: "right bottom",
              className: "error",
            });
          });
      });

      modalselector("building", "#department_building");
      // create department
      $(".create-department").click(function () {
        datacompany = `{
                    "query":"adddepartment",
                    "account_id": "${userInfo["account_id"]}",
                    "building_id": "${$("#department_building").val()}",
                    "department_name": "${$("#department_name").val()}",
                    "address2": "${$("#department_address").val()}",
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
          url: "https://api.raindroprdp.com/management",
          type: "POST",
          dataType: "text",
          data: datacompany,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            $.notify(
              "Building " + $("#building_name").val() + " added successfully",
              { position: "right bottom", className: "success" }
            );
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            $.notify("Some error", {
              position: "right bottom",
              className: "error",
            });
          });
      });

      modalselector("department", "#team_department");
      // create department
      $(".create-team").click(function () {
        datacompany = `{
                    "account_id": "${userInfo["account_id"]}",
                    "query": "addteam",
                    "department_id": "${$("#team_department").val()}",
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
          url: "https://api.raindroprdp.com/management",
          type: "POST",
          dataType: "text",
          data: datacompany,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            $.notify(
              "Building " + $("#building_name").val() + " added successfully",
              { position: "right bottom", className: "success" }
            );
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            $.notify("Some error", {
              position: "right bottom",
              className: "error",
            });
          });
      });

      // create raindrop
      $(".create-raindrop").click(function () {
        addraindrops = [];
        $(".member-block").each(function () {
          addraindrops.push({
            type_id: $(this).find(".specs-select").val(),
            // "template_id": $(this).find('.os-select option:selected').data('id'),
            template_id: $(this).find(".os-select").val(),
            email: $(this).find(".rd-email").val(),
          });
        });

        datacompany = `{
                    "query":"addmachines",
                    "account_id": "${userInfo["account_id"]}",
                    "team_id": "${$("#rd_modal_details").val()}",
                    "instances": "${JSON.stringify(addraindrops)}"
                }`;

        submitbutton = $(this);
        savetext = $(this).html();
        $(this)
          .prop("disabled", true)
          .html(
            `<div class= "spinner-border text-light" role = "status" > <span class="visually-hidden">Loading...</span></div > `
          );

        $.ajax({
          url: "https://api.raindroprdp.com/management",
          type: "POST",
          dataType: "text",
          data: datacompany,
        })
          .done(function (response) {
            result = JSON.parse(response);
            submitbutton.html(savetext).prop("disabled", false);
            $.notify(
              "Building " + $("#building_name").val() + " added successfully",
              { position: "right bottom", className: "success" }
            );
          })
          .fail(function () {
            submitbutton.html(savetext).prop("disabled", false);
            $.notify("Some error", {
              position: "right bottom",
              className: "error",
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

      let myTable = $("#example").DataTable({
        columnDefs: [
          {
            orderable: false,
            className: "select-checkbox",
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
        // 	"sSearch": '<a class="btn searchBtn" id="searchBtn"><i class="fa fa-search"></i></a>',
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
                <th>
                    <button id="MyTableCheckAllButton">
                        <span class="icon"></span>
                    </button>
                </th>
                <th>User</th>
                <th>Specs</th>
                <th>Type</th>
                <th>Disk Utilization</th>
                <th>Role</th>
                <th>Last Connected</th>
                <th>Last Connection</th>
            </tr> `);
          raindropsarray.forEach((element) => {
            $("#raindrops_table_body").append(`<tr>
                                <td></td>
                                <td>
                                    <div class="u-image"></div>
                                    <span class="e-name">
                                        ${element["user"]}
                                    </span>
                                </td>
                                <td>
                                    CPU: ${element["cpu_cores"]} Cores<br>RAM: ${
              element["RAM"]
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
                        <th>
                            <button id="MyTableCheckAllButton">
                                <span class="icon"></span>
                            </button>
                        </th>
                        <th>User</th>
                        <th>Specs</th>
                        <th>Type</th>
                        <th>Disk Utilization</th>
                        <th>Role</th>
                        <th>Last Connected</th>
                        <th>Last Connection</th>
                    </tr> `);
          pendingupgradearray.forEach((element) => {
            $("#raindrops_table_body").append(`
            <tr>
                    <td></td>
                    <td>
                        <div class="u-image"></div>
                        <span class="e-name">
                            ${element["user"]}
                        </span>
                    </td>
                    <td>
                        CPU: ${element["cpu_cores"]}, RAM: ${
              element["RAM"]
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
        if (name == "Departments") {
          $("#raindrops_table_head").html(`<tr>
                <th>
                    <button id="MyTableCheckAllButton">
                        <span class="icon"></span>
                    </button>
                </th>
                <th>Name</th>
                <th>Admin</th>
                <th>Edit</th>
            </tr> `);
          departmentsarray.forEach((element) => {
            $("#raindrops_table_body").append(`
                <tr>
                    <td></td>
                    <td>
                        <div class="u-image"></div>
                        <span class="e-name">
                            ${element["item_name"]}
                        </span>
                    </td>
                    <td>
                        ${element["admins"]}
                    </td>
                    <td>
                                    <button type="button" class="btn btn-outline-warning"><i class="bi bi-pencil-fill"></i></button>
                                </td>
                </tr>
            `);
          });
        }
        if (name == "Teams") {
          $("#raindrops_table_head").html(`<tr>
                <th>
                    <button id="MyTableCheckAllButton">
                        <span class="icon"></span>
                    </button>
                </th>
                <th>Name</th>
                <th>Admin</th>
                <th>Edit</th>
            </tr> `);
          teamsarray.forEach((element) => {
            $("#raindrops_table_body").append(`
            <tr>
                    <td></td>
                    <td>
                        <div class="u-image"></div>
                        <span class="e-name">
                            ${element["item_name"]}
                        </span>
                    </td>
                    <td>
                        ${element["admins"]}
                    </td>
                    <td>
                                    <button type="button" class="btn btn-outline-warning"><i class="bi bi-pencil-fill"></i></button>
                                </td>
                </tr>
            `);
          });
        }
        if (name == "Buildings") {
          $("#raindrops_table_head").html(`<tr>
                <th>
                    <button id="MyTableCheckAllButton">
                        <span class="icon"></span>
                    </button>
                </th>
                <th>Name</th>
                <th>Admin</th>
                <th>building_ip</th>
                <th>Edit</th>
            </tr> `);
          buildingsarray.forEach((element) => {
            $("#raindrops_table_body").append(`
            <tr>
                    <td></td>
                    <td>
                        <div class="u-image"></div>
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
                                    <button type="button" class="btn btn-outline-warning"><i class="bi bi-pencil-fill"></i></button>
                                </td>
                </tr>
            `);
          });
        }
        if (name == "Companies") {
          $("#raindrops_table_head").html(`<tr>
                        <th>
                            <button id="MyTableCheckAllButton">
                                <span class="icon"></span>
                            </button>
                        </th>
                        <th>Name</th>
                        <th>Admin</th>
                        <th>Outbound_Ip</th>
                        <th>Edit</th>
                    </tr>`);
          companiesarray.forEach((element) => {
            $("#raindrops_table_body").append(`
            <tr>
                    <td></td>
                    <td>
                        <div class="u-image"></div>
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
                                    <button type="button" class="btn btn-outline-warning"><i class="bi bi-pencil-fill"></i></button>
                                </td>
                </tr>
            `);
          });
        }

        myTable = $("#example").DataTable({
          columnDefs: [
            {
              orderable: false,
              className: "select-checkbox",
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
          // 	"sSearch": '<a class="btn searchBtn" id="searchBtn"><i class="fa fa-search"></i></a>',
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

      // CREATE CHART

      // console.log(content['activity']);
      // content['activity']['connections'].forEach(element => console.log(element));

      // let max_days = 31;
      // max_days += 2;

      // let i = 0;
      // content['activity']['connections'].forEach(element => {
      //     if (i <= max_days) {
      //         create_series[0]['data'].unshift(element);
      //     }
      //     i++;
      // });

      // i = 0;
      // content['activity']['upgrades'].forEach(element => {
      //     if (i <= max_days) {
      //         create_series[1]['data'].unshift(element);
      //     }
      //     i++;
      //     // if (i >= max_days) return;
      // });

      // i = 0;
      // content['activity']['reboots'].forEach(element => {
      //     if (i <= max_days) {
      //         create_series[2]['data'].unshift(element);
      //     }
      //     i++;
      // });

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

      // $('.last_14').click(function () {
      //     createCharts(14);
      // });

      // $('.last_30').click(function () {
      //     createCharts(30);
      // });

      // $('.last_7').click(function () {
      //     createCharts(7);
      // });

      createCharts(30);

      // if (option && typeof option === 'object') {
      //     myChart.setOption(option);
      // }

      // CHART 2

    //   var pie_data = [
    //     {
    //       value:
    //         content["environmental_detail"]["resources_preserved"]["water"],
    //       name: "Water",
    //     },
    //     {
    //       value:
    //         content["environmental_detail"]["resources_preserved"]["metals"],
    //       name: "Metals",
    //     },
    //     {
    //       value:
    //         content["environmental_detail"]["resources_preserved"]["plastics"],
    //       name: "Plastics",
    //     },
    //   ];

      $("#ewaste_prevented").text(
        content["environmental_detail"]["ewaste_prevented"]
      );
      $("#electricity_saved").text(
        content["environmental_detail"]["electricity_saved"]
      );

    //   var dom = document.getElementById("bar-chart-container");
    //   var myChart = echarts.init(dom, {
    //     renderer: "canvas",
    //     useDirtyRect: false,
    //   });

    //   var app = {};

    //   var option;

    //   option = {
    //     darkMode: true,
    //     // backgroundColor: ['#232C3B'],
    //     darkMode: "auto",
    //     title: {
    //       text: "Environmental",
    //       // subtext: 'Carriage quitting securing be appetite it declared',
    //       // backgroundColor:'rgba(0,0,0,0)',
    //       // borderColor: '#ccc',
    //       // borderWidth: '0',
    //       textStyle: {
    //         color: "#b3b9e2",
    //       },
    //     },

        // color : ['#FDB128', '#8768F1', '#FB268A', '#B3B9E2', '#2D5DC9', '#FDB128', '#8768F1', '#FB268A', '#B3B9E2', '#2D5DC9', '#FDB128', '#8768F1'],

    //     series: [
    //       {
    //         data: pie_data,
    //         type: "pie",
    //         barWidth: 11,
    //         showBackground: true,
    //         backgroundStyle: {
    //           color: "rgba(180, 180, 180, 0.2)",
    //         },
    //         itemStyle: {
    //           emphasis: {
    //             barBorderRadius: [50, 50],
    //           },
    //           normal: {
    //             barBorderRadius: [50, 50, 0, 0],
    //           },
    //         },
    //       },
    //     ],
    //   };

    //   if (option && typeof option === "object") {
    //     myChart.setOption(option);
    //   }

    //   window.addEventListener("resize", myChart.resize);
    });
  });

  // PRICING

  //     content['pricing']['windows'].forEach(element => {
  //         $('#pricing_windows').append(`< div class= "col" >
  //     <div class="price-card">
  //         <div class="price-card-title">
  //             ${element['type']}
  //         </div>
  //         <div style="padding: 10px 0; text-align: center;">
  //             CPU: <b>${element['cpu']} Core</b> <br> RAM: <b>${element['ram']}</b>
  //         </div>
  //         <div class="price-card-price">
  //         ${currency}${element['price']}
  //         </div>
  //     </div>
  // </div>`);
  //     });

  //     content['pricing']['linux'].forEach(element => {
  //         $('#pricing_linux').append(`<div class="col">
  //     <div class="price-card">
  //         <div class="price-card-title">
  //             ${element['type']}
  //         </div>
  //         <div style="padding: 10px 0; text-align: center;">
  //             CPU: <b>${element['cpu']} Core</b> <br> RAM: <b>${element['ram']}</b>
  //         </div>
  //         <div class="price-card-price">
  //         ${currency}${element['price']}
  //         </div>
  //     </div>
  // </div>`);
  //     });

  // $('#pending_upgrades').text(content['pending_upgrades']);



// ------------- FORM FUNCTIONALITY

$(document).ready(function(){
  $('#add_company').on('submit', function(e){
      e.preventDefault();
      var company_name = $('#company_name').val();

      $.ajax({
          url: management_url,
          type: 'POST',
          headers: {
              'Authorization': `Bearer ${access_token}`,  
          },
          contentType: 'application/json',
          data: JSON.stringify({
              "query": "addcompany",
              "name": company_name
          }),
          success: function(response){
              //Do something with the response
              console.log(response);
          },
          error: function(error){
              //Handle error
              console.log(error);
          }
      });
  });
});

  $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    })

});
