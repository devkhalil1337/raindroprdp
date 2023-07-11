// JavaScript Document

$(document).ready(function () {


    $(".navbar-toggler").click(function (e) {
        $(this).toggleClass("open");
        $("html").toggleClass("overflowSection");
        $(".h-left").toggleClass("show");
        e.preventDefault();
    });



    $('.mode .light-link').on('click', function () {

        $('body').addClass('light-mode');
        $('body').removeClass('dark-mode');
    });
    $('.mode .dark-link').on('click', function () {

        $('body').addClass('dark-mode');
        $('body').removeClass('light-mode');
    });


    $('.mode a').on('click', function () {
        if ($(this).hasClass('active')) return false;

        $('link.color-scheme-link').remove();

        $(this).addClass('active').siblings().removeClass('active');
        var src = $(this).attr('data-src'),
            colorScheme = $('<link class="color-scheme-link" rel="stylesheet" />');

        colorScheme
            .attr('href', src)
            .appendTo('head');
    });



    // $(".add-member .add-btn a").click(function () {
    //     clone_block = `<div class="member-block">
    //     <div class="row">
    //         <div class="col-6 col-sm-6 col-md-4">
    //             <div class="form-group">
    //                 <select name="" class="form-select form-control" id=""
    //                     style="width: 100%; max-width: 100%;">
    //                     <option value="">CPU: 1, RAM: 512MB</option>
    //                     <option value="">CPU: 1, RAM: 1GB</option>
    //                     <option value="">CPU: 1, RAM: 2GB</option>
    //                     <option value="">CPU: 2, RAM: 4GB</option>
    //                     <option value="">CPU: 2, RAM: 8GB</option>
    //                     <option value="">CPU: 4, RAM: 16GB</option>
    //                     <option value="">CPU: 8, RAM: 32GB</option>
    //                 </select>
    //             </div>
    //         </div>
    //         <div class="col-6 col-sm-6 col-md-4">
    //             <div class="form-group">
    //                 <div class="form-group">
    //                     <input type="text" class="form-control"
    //                         placeholder="Write the user email">
    //                 </div>
    //             </div>
    //         </div>
    //         <div class="col-6 col-sm-6 col-md-3">
    //             <div class="form-group">
    //                 <select name="" class="form-select form-control" id=""
    //                     style="width: 100%; max-width: 100%;">
    //                     <option value="">default_windows</option>
    //                     <option value="">default_linux</option>
    //                 </select>
    //             </div>
    //         </div>
    //         <div class="col-6 col-sm-6 col-md-1">
    //             <div class="action" style="display: flex; justify-content: center;">
    //                 <div class="delete" style="margin-left: unset;">
    //                     <a href="#">
    // <svg xmlns="http://www.w3.org/2000/svg" width="35"
    //     height="35" viewBox="0 0 35 35">
    //     <g id="Group_7038" data-name="Group 7038"
    //         transform="translate(-1670 -949)">
    //         <g id="Path_2516" data-name="Path 2516"
    //             transform="translate(1670 949)"
    //             fill="rgba(253,177,40,0.06)">
    //             <path
    //                 d="M 30 34.5 L 5 34.5 C 2.51869010925293 34.5 0.5 32.4813117980957 0.5 30 L 0.5 5 C 0.5 2.51869010925293 2.51869010925293 0.5 5 0.5 L 30 0.5 C 32.4813117980957 0.5 34.5 2.51869010925293 34.5 5 L 34.5 30 C 34.5 32.4813117980957 32.4813117980957 34.5 30 34.5 Z"
    //                 stroke="none" />
    //             <path
    //                 d="M 5 1 C 2.794391632080078 1 1 2.794391632080078 1 5 L 1 30 C 1 32.20560836791992 2.794391632080078 34 5 34 L 30 34 C 32.20560836791992 34 34 32.20560836791992 34 30 L 34 5 C 34 2.794391632080078 32.20560836791992 1 30 1 L 5 1 M 5 0 L 30 0 C 32.76142120361328 0 35 2.238571166992188 35 5 L 35 30 C 35 32.76142120361328 32.76142120361328 35 30 35 L 5 35 C 2.238571166992188 35 0 32.76142120361328 0 30 L 0 5 C 0 2.238571166992188 2.238571166992188 0 5 0 Z"
    //                 stroke="none" fill="#fdb128" />
    //         </g>
    //         <g id="trash_1_" data-name="trash (1)"
    //             transform="translate(1678.213 957.756)">
    //             <path id="Path_2516-2" data-name="Path 2516"
    //                 d="M15.845,2.915H13.586A3.65,3.65,0,0,0,10.015,0H8.558A3.65,3.65,0,0,0,4.988,2.915H2.729a.729.729,0,1,0,0,1.457h.729v9.473A3.648,3.648,0,0,0,7.1,17.488h4.372a3.648,3.648,0,0,0,3.643-3.643V4.372h.729a.729.729,0,1,0,0-1.457ZM8.558,1.457h1.457a2.19,2.19,0,0,1,2.061,1.457H6.5A2.19,2.19,0,0,1,8.558,1.457Zm5.1,12.388a2.186,2.186,0,0,1-2.186,2.186H7.1a2.186,2.186,0,0,1-2.186-2.186V4.372h8.744Z"
    //                 fill="#fdb128" />
    //             <path id="Path_2517" data-name="Path 2517"
    //                 d="M9.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,0,0-1.457,0V15.1A.729.729,0,0,0,9.729,15.829Z"
    //                 transform="translate(-1.899 -2.713)"
    //                 fill="#fdb128" />
    //             <path id="Path_2518" data-name="Path 2518"
    //                 d="M13.729,15.829a.729.729,0,0,0,.729-.729V10.729a.729.729,0,1,0-1.457,0V15.1A.729.729,0,0,0,13.729,15.829Z"
    //                 transform="translate(-2.985 -2.713)"
    //                 fill="#fdb128" />
    //         </g>
    //     </g>
    // </svg>

    //                     </a>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // </div>`;

    //     $(".member-list").append(clone_block);
    //     $('.member-list-main').animate({ scrollTop: $('.member-list-main').prop("scrollHeight") }, 500);
    // });


    /////////////////

    // $('.action').on('click', '.delete a', function () {
    //     $(this).parents('.member-block').remove();
    // });

    // $('.add-member').on('click', '.add-btn a', function () {
    //     $(".member-block:first-child").clone().appendTo(".member-list");
    //     // $(this).parents('.member-block').remove();
    // });

    $(document).on("click", ".action .delete a", function (e) {
        $(this).parents('.member-block').remove();
    });

    // OFI Browser
    objectFitImages();
});


// function changeCSS(cssFile, cssLinkIndex) {

//     var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

//     var newlink = document.createElement("link");
//     newlink.setAttribute("rel", "stylesheet");
//     newlink.setAttribute("type", "text/css");
//     newlink.setAttribute("href", cssFile);

//     document.getElementsByTagName("head").item(cssLinkIndex).replaceChild(newlink, oldlink);
// }



