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




function getDissimilarityAssocBetwnDoc(p_doc1, count) {
    
    //getDocumentAssociationData();
    //var AllDoc = G_DATA_JSON.ResponceMoreLikeDoc;
    //Get document index for both the items

    //var AllDoc = G_DATA_JSON.DOC_ASSOC_MATRIX_New;
    //    var LDocData = AllDoc["czs9ix/node/"+p_doc1+""].docs,
    //var LDocData = AllDoc["czs9ix/node/10192"].docs;
    var LDocData = G_DATA_JSON.DOC_ASSOC_MATRIX_New;

    //for (var LLoopIndex = 0; LLoopIndex < LDocData.length; LLoopIndex++) {
    var LObj = LDocData[count];
            return LObj.score;
    //}
}


function getDocumentAssociationData(entity_id, fn) {
    
  // use when get data from solr based on entity id
//    $.ajax({

//        //'url': 'http://int-srch.un.org:8983/solr/acabq/un_search/?q=peace+entity_id:' + entity_id + '&fl=label,entity_id,score&mlt=true&mlt.fl=content&mlt.mindf=1&mlt.mintf=1&mlt.count=366&rows=1',
//        'url': 'http://tgn254:8088/solr/collection1/select?q=*%3A*&wt=json&indent=' + entity_id,
//        'data': { 'entity_id': entity_id, 'q': 'your search goes here' },
//        'success': function (data) {
//            var data = eval(data);
//            LoadjsonData(data)
//        },
//        'dataType': 'jsonp',
//        'jsonp': 'json.wrf'
//    });


//    function LoadjsonData(data) {
//       
//        G_DATA_JSON.DOC_ASSOC_MATRIX_New = data.moreLikeThis["czs9ix/node/"+entity_id+""].docs;
//        fn(G_DATA_JSON.DOC_ASSOC_MATRIX_New);
//    }


    // for local use
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


