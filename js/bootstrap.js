/**
* Created with JetBrains WebStorm.
* User: Digvijay.Upadhyay
* Date: 10/21/13
* Time: 6:19 PM
* To change this template use File | Settings | File Templates.
*/

var G_SELECTED_WORDS = [
];

var G_DATA_JSON = {
    WORD_DOC_LOAD: {},
    WORD_FREQ_PER_DOC: {},
    WORD_TOTAL: {},
    DOC_DATA: [],
    DOC_ASSOC_MATRIX: null,
    DOC_ASSOC_MATRIX_New: null,
    //test
    DOC_Date: [],
    DOCAssoc: null,
    MoreLikeThisDoc: [],
    ResponceDoc: [],
    ResponceMoreLikeDoc: [],
    DOC_RADIUS_DATA: []

}

var G_DOC_ASSOCIATION_THREASHOLD = 0;

var G_DOCUMENT_TYPE = [{
    //        typeName : "Type A",
    typeName: "Audit Reports",
    typeCode: 0,
    isSelected: true
}, {
    //        typeName : "Type B",
    typeName: "ACABQ Documents",
    typeCode: 1,
    isSelected: true
}, {
    //        typeName : "Type C",
    typeName: "IT Policy & Standards",
    typeCode: 2,
    isSelected: true
}, {
    //        typeName : "Type D",
    typeName: "GA Resolutions",
    typeCode: 3,
    isSelected: true
}, {
    //        typeName : "Type E",
    typeName: "Other",
    typeCode: 4,
    isSelected: true
}];

var G_DOCUMENT_CIRCLE_LEGENDS = [{
    min: 0,
    max: 100,
    documentBubbleRadius: 10
},
    {
        min: 101,
        max: 1000,
        documentBubbleRadius: 15
    }, {

        min: 1000,
        documentBubbleRadius: 20
    }];

//Set the hashed URL to blank
//window.location.hash = "";

    function preBootstrap() {
        var showme = document.getElementById("wordFreqFhrtSvg");
        showme.style.visibility = "hidden";
    setTimeout(bootstrap, 200);
}


function bootstrap() {
    var LdocumentTrailDiv = $("#document-click-trail"),
        LTop = 10,
        LLeft = $(window).width() - $(LdocumentTrailDiv).width() - 10;

    $(LdocumentTrailDiv).css({
        top: LTop + 'px',
        left: LLeft + 'px'
    });


//    d3.json("data/acabq-query-peace-loadLineAndScatter.json", function (p_data) {

//        //The json has been loaded
//        G_DATA_JSON.WORD_DOC_LOAD = p_data;

        //create the word list
    var LwordListConfig = {
        divId: "word-list-cntnr-chrt",
        onAddKeyWord: function (p_Keyword) {
           
            d3.selectAll("line").remove();
            d3.selectAll("circle").remove();
            //d3.select("#wordFreqFhrtSvg").remove();
            LTimeLineGenerator.clearLoadedDocument();
            LTimeLineGenerator.hideSlider();
            LTimeLineGenerator.documentViewMode = "timeline_view";
            LTimeLineGenerator.focussedCircle = null;
            //LTimeLineGenerator.frequencyChartLinesData[p_Keyword]=null;
            //LMe.frequencyChartLinesData= null;
           // LTimeLineGenerator.updateKeywordFrequencyLines();
            LTimeLineGenerator.addKeyWordToGraph(p_Keyword);

        },
        onRemoveKeyWord: function (p_Keyword) {
            LTimeLineGenerator.removeKeywordFromGraph(p_Keyword);
        }
    };
        var LWordList = clsWordListGenerator(LwordListConfig);

        //create the time line
        //The json has been loaded
        var Lw = $(".word-freq-chart").width();
        LConfig = {
            svgId: "wordFreqFhrtSvg",
            height: 600,
            width: Lw,
            timelineHeight: 200,
            timelineWidth: Lw,
            margin: {
                top: 20,
                right: 15,
                bottom: 20,
                left: 15
            },
            onDocumentBubbleClick: function (p_Document) {
                //LDocumentClickTrailMgr.addDocumentClick(p_Document.documentName);
                //LDocumentAssocChart.drawDocumentAssociationChart(LTimeLineGenerator.brush.extent(), p_Document);
            }
        };
        var LTimeLineGenerator = new clsTimeLineGenerator(LConfig);

   // });
    //Prepare the word list
}