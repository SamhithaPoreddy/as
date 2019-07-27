(function ($) {
    'use strict';

    /*[ File Input Config ]
        ===========================================================*/
    
    try {
    
        var file_input_container = $('.js-input-file');
    
        if (file_input_container[0]) {
    
            file_input_container.each(function () {
    
                var that = $(this);
    
                var fileInput = that.find(".input-file");
                var info = that.find(".input-file__info");
    
                fileInput.on("change", function () {
    
                    var fileName = $(this).prop("files")
    
                    if(fileName === undefined || fileName.length == 0) {
                        info.text("No file chosen");
                    } else {
                        var filenames = $.map(fileName, function(val) { return val.name; });
                        info.text(filenames.join(", "));
                    }
    
                })
    
            });
    
        }
    }
    catch (e) {
        console.log(e);
    }

})(jQuery);