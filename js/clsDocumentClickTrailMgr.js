function clsDocumentClickTrailMgr(p_Config){
    var LMe = this;

    LMe.documentClickTrailQueue = [];

    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

    };

    //---------------------------------------------------------------

    LMe.addDocumentClick = function(p_DocumentName){
        LMe.documentClickTrailQueue.push(p_DocumentName);
        var LClickTrailContent = d3.select("#document-click-trail .click-trail-content"),
            LClickTrailHTML = LClickTrailContent.html();
        LClickTrailHTML += p_DocumentName + '<br>';
        LClickTrailContent.html(LClickTrailHTML);

        //Adjust position of the document click trail
        var LdocumentTrailDiv = $("#document-click-trail"),
            LTop = 10,
            LLeft = $(window).width() - $(LdocumentTrailDiv).width() - 10;

        $(LdocumentTrailDiv).css({
            top : LTop  + 'px',
            left : LLeft  + 'px'
        });
    }

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}


