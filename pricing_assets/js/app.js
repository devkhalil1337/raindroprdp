$(document).ready(function () {
  $("#pricing-tb").DataTable({
    ajax: {
      url: "/types.json",
      type: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "Authorization",
          "Bearer " + sessionStorage.getItem("token")
        );
      },
      dataSrc: function (json) {
        return json.map(function (item) {
          return [
            item.raindrop_type,
            item.specs,
            item.os_type,
            `$${item.level_1_price}`,
            `$${item.level_2_price}`,
            `$${item.level_3_price}`,
          ];
        });
      },
    },
    columnDefs: [
      {
        defaultContent: "-",
        targets: "_all",
      },
    ],
    searching: false,
    lengthChange: false,
    info: false,
    autoWidth: false,
    pageLength: -1,
    paginate: false,
    responsive: true,
    order: [[4, "asc"]],
    rowGroup: {
      dataSrc: 2,
    },
    responsive: {
      breakpoints: [
        { name: "desktop", width: Infinity },
        { name: "tablet", width: 1024 },
        { name: "phone", width: 778 },
      ],
    },
    columns: [
      { className: "all" },
      { className: "all" },
      { className: "min-tablet" },
      { className: "min-tablet" },
      { className: "min-tablet" },
      { className: "min-tablet" },
    ],
  });
});
