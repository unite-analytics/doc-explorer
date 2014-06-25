function clsWordListGenerator(p_Config){
    var LMe = this;

    LMe.divId = "";

    LMe.keywordList = [];



    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        LMe.keywordList = G_SELECTED_WORDS;
        LMe.container = d3.select("#word-list-cntnr-chrt ul");
        LMe.displayKeywordsFromList(true);
    };

    //---------------------------------------------------------------
    LMe.displayKeywordsFromList = function(p_ClearAll){
        if(p_ClearAll === true)
        {
            LMe.container.html('');

            var LI = LMe.container.append("li");

            LMe.addNewKeywordEdt = LI.append('input')
                .attr("class", "new-keyword-edt")
                .attr("id", "addNewKeywordEdt")
                .on("keypress", function(e){
                    if (d3.event.keyCode == 13) {
                        LMe.addNewKeywordToList();
                    }
                });

            var autocomp = $("#addNewKeywordEdt").autocomplete({
                source: G_DATA_JSON.WORD_FREQ_PER_DOC.FIELD1,
                search: function( event, ui ) {
                    //console.log('serach event');

                    /*setTimeout(function(){
                        $( "#addNewKeywordEdt" ).autocomplete( "search", "x" );
                    }, 500);*/
                    //return false;
                },
                formatItem: function(item){
                    return item.text;
                }
            });

            LMe.addNewKeywordBtn = LI.append('div')
                .attr("id", "addNewKeywordBtn")
                .attr("class", "new-keyword-btn")
                .text("+")
                .on("click", LMe.addNewKeywordToList);
        }

        for(var LLoopIndex=0; LLoopIndex < LMe.keywordList.length; LLoopIndex++)
        {
            var Lkeyword = LMe.keywordList[LLoopIndex];
            LMe.addNewKeywordToVisualList(Lkeyword);
        }
    };

    //---------------------------------------------------------------
    LMe.addNewKeywordToVisualList = function(p_keyword){
        var LI = LMe.container.append("li");

        var LIndex = libGetIndexOfWord(G_DATA_JSON.WORD_TOTAL.FIELD1,p_keyword),
            LTotalOccurances = 0;
        if(LIndex > -1)
        {
            LTotalOccurances = G_DATA_JSON.WORD_TOTAL.total[LIndex];
        }

        //Get total occurances of keyword
        var LKeyword = LI.append('div')
            .attr('class', "keyword-vis")
            .datum(p_keyword)
            .on('mouseover', LMe.HandleOnMouseHover)
            .on('mouseout', LMe.HandleOnMouseOut)
            .on('click', LMe.HandleOnWordClick);

        LKeyword.append("span")
            .text(p_keyword + " (" + LTotalOccurances + ")");

        LKeyword.append("span")
            .attr('class', 'rem-keyword')
            .text('x')
            .on('click', function(){
                var index = LMe.keywordList.indexOf(p_keyword);    // <-- Not supported in <IE9
                if (index !== -1) {
                    LMe.keywordList.splice(index, 1);
                }
                LI.remove();
                LMe.onRemoveKeyWord(p_keyword);
            });

        /*LKeyword
            .append('div')
            .attr('class', 'rem-keyword')
            .text('x')

            .on('click', function(){
                var index = LMe.keywordList.indexOf(p_keyword);    // <-- Not supported in <IE9
                if (index !== -1) {
                    LMe.keywordList.splice(index, 1);
                }
                LTD.remove();

                LMe.onRemoveKeyWord(p_keyword);
            });*/
    };

    //---------------------------------------------------------------
    LMe.addNewKeywordToList = function(){
        var LNewKeyword = LMe.addNewKeywordEdt[0][0].value;
        LNewKeyword = LNewKeyword.trim();

        if(LNewKeyword == "")
        {
            alert('Please enter a keyword');
            return;
        }

        //Check if the keyword is already in the list
        for(var LLoopIndex=0; LLoopIndex < LMe.keywordList.length; LLoopIndex++){
            var LKeyword = LMe.keywordList[LLoopIndex];
            if(LNewKeyword.toUpperCase() == LKeyword.toUpperCase())
            {
                //The entered keyword already exists can not add it
                alert('The keyword entered by you is already selected.');
                return;
            }
        }
        LMe.keywordList.push(LNewKeyword);
        LMe.addNewKeywordToVisualList(LNewKeyword);
        LMe.addNewKeywordEdt[0][0].value = '';
        LMe.onAddKeyWord(LNewKeyword);
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}


