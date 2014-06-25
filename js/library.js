//---------------------------------------------------------------
function libGetIndexOfWord(p_Array, p_Word) {
    var LResult = -1; //Index of the word in the array
    for (var LLoopIndex = 0; LLoopIndex < p_Array.length; LLoopIndex++) {
        var ArrayEl = p_Array[LLoopIndex];
        if (ArrayEl == p_Word) {
            //Keyword found return the index of that key word
            LResult = LLoopIndex;
            return LResult;
        }
    }

    //The word was no found in the array
    return LResult;
}

//---------------------------------------------------------------
function getDocumentAssociationMatrixData(fn) {
    debugger;
    if (!G_DATA_JSON.DOC_ASSOC_MATRIX) {
        //The data is not loaded load the function
        d3.csv("data/docAssocMatrix_SIMILARITY.csv", function (p_data) {
            G_DATA_JSON.DOC_ASSOC_MATRIX = p_data;
            fn(G_DATA_JSON.DOC_ASSOC_MATRIX);
        });
    }
    else {
        fn(G_DATA_JSON.DOC_ASSOC_MATRIX);
    }
}

//---------------------------------------------------------------
function isDocTypeSelected(p_docTypeCode) {
    for (var LLoopIndex = 0; LLoopIndex < G_DOCUMENT_TYPE.length; LLoopIndex++) {
        var LItem = G_DOCUMENT_TYPE[LLoopIndex];
        if (LItem.typeCode == p_docTypeCode && LItem.isSelected === true) {
            return true;
        }
    }
    return false;
}

//---------------------------------------------------------------
function getDocumentTypeTitle(p_docTypeCode) {
    for (var LLoopIndex = 0; LLoopIndex < G_DOCUMENT_TYPE.length; LLoopIndex++) {
        var LItem = G_DOCUMENT_TYPE[LLoopIndex];
        if (LItem.typeCode == p_docTypeCode && LItem.isSelected === true) {
            return LItem.typeName;
        }
    }
}

//---------------------------------------------------------------

//---------------------------------------------------------------
//function getDissimilarityAssocBetwnDoc(p_doc1, p_doc2) {


//    G_DATA_JSON.DOC_ASSOC_MATRIX;
//    //Get document index for both the items
//    var LDocData = G_DATA_JSON.DOC_DATA,
//        Ldoc1Index = -1,
//        Ldoc2Index = -1;

//    for (var LLoopIndex = 0; LLoopIndex < LDocData.length; LLoopIndex++) {
//        var LObj = LDocData[LLoopIndex];
//        //        console.log(LLoopIndex);

//        if (LObj.Filename == p_doc1) {
//            //index for first doc
//            try {
//                Ldoc1Index = LObj.index;
//            } catch (e) {
//                console.log("There is a problem assigning the index of LObj:" + e.message);
//            }
//            //            console.log("hi");
//        }

//        if (LObj.Filename == p_doc2) {
//            try {
//                //Index for second doc
//                Ldoc2Index = LObj.index;
//            } catch (e) {
//                console.log("There is a problem assigning the index of LObj:" + e.message);
//            }
//            //            console.log("bye");
//        }
//        if ((Ldoc1Index > -1) && (Ldoc2Index > -1)) {
//            //both indexes are found
//            break;
//        }
//    }

//    var LRowNo = Ldoc1Index,
//        LColNo = Ldoc2Index,
//        LSimillarityAssoc;

//    if (checkForUndefined(LRowNo) || checkForUndefined(LColNo)) {
//        console.log("The index for left and right document is undefined - no set");
//        return 0;
//    }
//    else {
//        if (Ldoc1Index < Ldoc2Index) {
//            LRowNo = Ldoc2Index;
//            LColNo = Ldoc1Index;
//        }

//        LRowNo = LRowNo - 2;
//        LSimillarityAssoc = G_DATA_JSON.DOC_ASSOC_MATRIX[LRowNo][LColNo];
//        //    console.log(G_DATA_JSON.DOC_ASSOC_MATRIX);
//        //    console.log(LSimillarityAssoc);
//        return (1 - LSimillarityAssoc);
//    }

//}

//---------------------------------------------------------------

function checkForUndefined(Ent) {
    if ((typeof value === 'undefined')) {
        return true;
    }
}


//test for association


function checkAssocaition(event_ID) {
    
    var LMTest = G_DATA_JSON.WORD_DOC_LOAD,
            LScatterChartData,
            LCompeleteChartData,
            LMoreLikeThisforbubble,
             MoreLikeTisDocBubble = [],
        LPrevYVal = 0;

    var dateparse = d3.time.format("%Y-%m-%dT%H:%M:%SZ");
    LMoreLikeThisforbubble = LMTest.moreLikeThis;


    var j = "czs9ix/node/" + event_ID;
    for (var i in LMoreLikeThisforbubble) {
        if (i == j) {
            var iop = LMoreLikeThisforbubble[i].docs;

            for (var LLoopIndex = 0; LLoopIndex < iop.length; LLoopIndex++) {
                //MoreLikeTisDocBubble.push(iop[LLoopIndex]);

                var LDoc = iop[LLoopIndex],
                            LDocumentName = LDoc.label,
                            LDocumentTitle = LDoc.teaser,
                            LDocumentDate = dateparse.parse(LDoc.publicationDate),
                            LSize = 5,
                            LEntity_Id = LDoc.entity_id,
                            LDocScore = LDoc.score;


                var LDocumentCircleData = {

                    Filename: LDocumentName,
                    DatePublish: LDocumentDate,
                    DocTitle: LDocumentTitle,
                    DocLabel: LDocumentTitle,
                    DocType: 1,
                    index: 1,
                    Size: LSize,
                    Entity_Id: LEntity_Id,
                    BubbleColor: 'grey',
                    Score: LDocScore


                };




                //Add the frequency data to the date published
                MoreLikeTisDocBubble.push(LDocumentCircleData);

            }
        }
    }
    var LUnorderedScatterChartData = MoreLikeTisDocBubble;
    var LScatterChartData = [],
                    LPrevYVal = 0;
    for (var LLoopIndex = 0; LLoopIndex < LUnorderedScatterChartData.length; LLoopIndex++) {
        var d = LUnorderedScatterChartData[LLoopIndex],
                        LDocumentName = d.Filename,
                        LObj = {};

       

        // bring in data from doc_data.json
        LObj.id = LLoopIndex;
        LObj.Filename = LDocumentName;
        LObj.DatePublish = d.DatePublish;
        LObj.DocType = d.DocType;
        LObj.DocTitle = d.DocTitle;
        LObj.keywords = [];
        LObj.keywordOccurances = [];
        
        LObj.LSize = d.Size;
        LObj.BubbleColor = d.BubbleColor;
        LObj.Entity_Id = LEntity_Id;
        LObj.Score = d.Score;
        LScatterChartData.push(LObj);
    }


    return LScatterChartData;



}



//function getDissimilarityAssocBetwnDoc(p_doc1, p_doc2) {

//  var AllDoc=  G_DATA_JSON.ResponceMoreLikeDoc;
//    //Get document index for both the items
//    var LDocData =AllDoc,
//        Ldoc1Index = -1,
//        Ldoc2Index = -1;

//    for (var LLoopIndex = 0; LLoopIndex < LDocData.length; LLoopIndex++) {
//        var LObj = LDocData[LLoopIndex];

//        if (LObj.Filename == p_doc2) {
//     
//        return LObj.Score;
//            
//        }
//      }
//}




function getDissimilarityAssocBetwnDoc(p_doc1, p_doc2) {
   
    //getDocumentAssociationData();
    //var AllDoc = G_DATA_JSON.ResponceMoreLikeDoc;
    //Get document index for both the items

    //var AllDoc = G_DATA_JSON.DOC_ASSOC_MATRIX_New;
    //    var LDocData = AllDoc["czs9ix/node/"+p_doc1+""].docs,
    //var LDocData = AllDoc["czs9ix/node/10192"].docs;
    var LDocData = G_DATA_JSON.DOC_ASSOC_MATRIX_New;

    for (var LLoopIndex = 0; LLoopIndex < LDocData.length; LLoopIndex++) {
        var LObj = LDocData[LLoopIndex];
            return LObj.score;
    }
}


function getDocumentAssociationData(entity_id, fn) {
    $.ajax({
        'url': 'http://tgn254:8088/solr/collection1/select?q=*%3A*&wt=json&indent=true',
        'data': { 'wt': 'json', 'q': 'your search goes here' },
        'success': function (data) {
           
            var data = eval(data);
            LoadjsonData(data)
        },
        'dataType': 'jsonp',
        'jsonp': 'json.wrf'
    });
    function LoadjsonData(data) {
       
    }
    if (!G_DATA_JSON.DOC_ASSOC_MATRIX_New) {

        //The data is not loaded load the function
        d3.json("data/acabq-query-onlyMoreLikeThis_new.json", function (p_data) {
            //            G_DATA_JSON.DOC_ASSOC_MATRIX_New = p_data.moreLikeThis["czs9ix/node/" + entity_id + ""].docs;
            G_DATA_JSON.DOC_ASSOC_MATRIX_New = p_data.moreLikeThis["czs9ix/node/10192"].docs;
            fn(G_DATA_JSON.DOC_ASSOC_MATRIX_New);
        });
    }
    else {
        fn(G_DATA_JSON.DOC_ASSOC_MATRIX_New);
    }
}


