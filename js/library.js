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

function checkForUndefined(Ent) {
    if ((typeof value === 'undefined')) {
        return true;
    }
}



function getDissimilarityAssocBetwnDoc(p_doc1, count) {
    var LDocData = G_DATA_JSON.DOC_ASSOC_MATRIX_New;
    var LObj = LDocData[count];
    return LObj.score;
}


function getDocumentAssociationData(entity_id, fn) {
    var surl = 'http://int-srch.un.org:8983/solr/acabq/un_search/?q=peace+entity_id:' + entity_id + '&fl=label,entity_id,score&mlt=true&mlt.fl=content&mlt.mindf=1&mlt.mintf=1&mlt.count=366&rows=1';

    $.ajax({
        type: 'GET',
        url: surl,
        crossDomain: true,
        data: {},
        dataType: "jsonp",
        jsonp: 'json.wrf',
        success: function (data) {
            var data = eval(data);
            LoadjsonData(data)
        },
        error: function (xhr, status, error) {
            // alert('Servidor de error 404 !!');
        },
        async: false,
        cache: false
    });


    function LoadjsonData(data) {
            G_DATA_JSON.DOC_ASSOC_MATRIX_New = data.moreLikeThis["czs9ix/node/"+entity_id+""].docs;
            fn(G_DATA_JSON.DOC_ASSOC_MATRIX_New);
        }



    // for local use
//    if (!G_DATA_JSON.DOC_ASSOC_MATRIX_New) {

//        //The data is not loaded load the function
//        d3.json("data/acabq-query-onlyMoreLikeThis_new.json", function (p_data) {
//            //            G_DATA_JSON.DOC_ASSOC_MATRIX_New = p_data.moreLikeThis["czs9ix/node/" + entity_id + ""].docs;
//            G_DATA_JSON.DOC_ASSOC_MATRIX_New = p_data.moreLikeThis["czs9ix/node/10192"].docs;
//            fn(G_DATA_JSON.DOC_ASSOC_MATRIX_New);
//        });
//    }
//    else {
//        fn(G_DATA_JSON.DOC_ASSOC_MATRIX_New);
//    }
}


function LoadJsonData(search_word, fn) {
    search_word = encodeURI(search_word);
   var surl = 'http://int-srch.un.org:8983/solr/acabq/un_search/?q=' + search_word + '&fl=label,entity_id,url,teaser,publicationDate,score,sm_field_document_type,sm_vid_Document_Subject,termfreq%28content,%27' + search_word + '%27%29,tf%28content,%27' + search_word + '%27%29,ttf%28content,%27' + search_word + '%27%29&facet=true&facet.date=publicationDate&facet.date.start=NOW/DAY-40YEARS&facet.date.end=NOW/DAY%2B1DAY&facet.date.gap=%2B1DAY&rows=366';
      $.ajax({
          type: 'GET',
          url: surl,
          crossDomain: true,   
          data: {},
          dataType: "jsonp",
          jsonp: 'json.wrf',
          success: function (data) {
              var data = eval(data);
              LoadData(data)
          },
          error: function (xhr, status, error) {
             // alert('Servidor de error 404 !!');
          },
          async: false,
          cache: false
      });
       function LoadData(data) {
                G_DATA_JSON.WORD_DOC_LOAD = data;
                fn(G_DATA_JSON.WORD_DOC_LOAD);
    
                }
   
//    if (search_word == 'budget') {
//        d3.json("data/un_search-budget.json", function (p_data) {

//            G_DATA_JSON.WORD_DOC_LOAD = p_data;
//            //LMe.DateValue();
//            //G_DATA_JSON.DOCAssoc = 1;
//            fn(G_DATA_JSON.WORD_DOC_LOAD);
//        });
//    }
//    else if (search_word == 'war') {
//        d3.json("data/un_search-war.json", function (p_data) {

//            G_DATA_JSON.WORD_DOC_LOAD = p_data;
//            //LMe.DateValue();
//            //G_DATA_JSON.DOCAssoc = 1;
//            fn(G_DATA_JSON.WORD_DOC_LOAD);
//        });
//    }
//    else if (search_word == 'armed conflict') {
//        d3.json("data/Armed.json", function (p_data) {

//            G_DATA_JSON.WORD_DOC_LOAD = p_data;
//            //LMe.DateValue();
//            //G_DATA_JSON.DOCAssoc = 1;
//            fn(G_DATA_JSON.WORD_DOC_LOAD);
//        });
//    }
//    else if (search_word == 'peace') {
//        d3.json("data/acabq-query-peace-loadLineAndScatter.json", function (p_data) {

//            G_DATA_JSON.WORD_DOC_LOAD = p_data;
//            //LMe.DateValue();
//            //G_DATA_JSON.DOCAssoc = 1;
//            fn(G_DATA_JSON.WORD_DOC_LOAD);
//        });
//    }

}


