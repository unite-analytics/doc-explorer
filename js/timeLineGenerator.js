//To generate the time line we need to know which are the documents which contain the words
//And after that we need to get how many occurances are there
//In order to generate the time line we need the minimum and maximum time
//So we have to load the data file json

/*
* 1. Get which documents have the words
* 2. Get the occurances in each document
* 3. Draw the graph*
*/
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};


function clsTimeLineGenerator(p_Config) {
    var LMe = this;
    LMe.svgId = "";
    LMe.dateFormat = d3.time.format("%e-%b-%y");
    LMe.scaleDateDisplayFormat = d3.time.format("%b %Y");

    //Object to format Y axis to percentage
    LMe.formatPercent = d3.format(".0%");

    LMe.frequencyChartLinesData = {};

    LMe.keywordList = [];

    LMe.color1 = d3.scale.category20c();

    LMe.timoutObj = null;

    LMe.documentViewMode = "timeline_view";
    //LMe.documentViewMode = "association_view";

    LMe.focussedCircle = null;

    //---------------------------------------------------------------
    LMe.constructor = function (p_Config) {
        //Assign the configuration attributes
        for (p_Name in p_Config) {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        LMe.tooltip = d3.select("#tooltip")
            .html("")
            .style("position", "absolute")
            .style("z-index", "99999")
            .style("visibility", "hidden")
            .text("")
            .on("mouseenter", function () {
                //console.log('hint mouseover');
                if (LMe.timoutObj) {
                    window.clearTimeout(LMe.timoutObj);
                }

                LMe.tooltip.style("visibility", "display");
            })
            .on("mouseleave", function () {
                LMe.tooltip.style("visibility", "hidden");
            });

        LMe.tooltip.append('div')
            .attr("class", "tooltip-html");

        /*LMe.tooltip.append('div')
        .attr("class", "tail");*/

        var Lwidth = LMe.width + LMe.margin.left + LMe.margin.right,
            Lheight = LMe.height + LMe.margin.top + LMe.margin.bottom;

        LMe.svg = d3.select("#" + LMe.svgId);
        LMe.svg
            .attr("width", Lwidth + "px")
            .attr("height", Lheight + "px");

        var Lw = $(".word-freq-chart").width();
        LMe.width = Lw;
        LMe.timelineWidth = Lw;
        LMe.svg
            .attr("width", Lw + "px");

        LMe.initializeTimeLine();

        LMe.displayAssociationScalesCircles();
        LMe.hideAssociationScaleCircles();
        //LMe.drawAssociationLines();

        LMe.createSlider();
    };

    //---------------------------------------------------------------
    LMe.initializeTimeLine = function () {

        //LMe.DateValue();
        //Draw the scales
        LMe.drawGraphScales();
        //LMe.drawKeywordFreqChartForKeyword('test');
        LMe.scatterChartTextGroup = LMe.scatterChartGroup.append("g");


        var LY = LMe.height - LMe.timelineHeight - LMe.margin.top - LMe.margin.bottom - 150;

        LMe.scatterChartText = LMe.scatterChartTextGroup.append("text")
            .attr("x", 10)
            .attr("y", LY - 65)
            .attr("class", "scatter-chart-text")
            .text("");

        LMe.scatterChartTextGroup.attr("transform", "translate(" + 0 + ", " + LY + ")");

        var brush = d3.svg.brush()
            .x(LMe.x)
            .on("brush", function (d) {
                LMe.adjustScatterChartAxis();
                LMe.handleOnBrush(d);
            })
            .on("brushend", LMe.handleOnBrush);

        var brushg = LMe.timelineGroup.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(" + (LMe.margin.left + 10) + ",0)")
            .call(brush);

        brushg.selectAll(".resize").append("path")
            .attr("transform", "translate(0," + -12 + ")")
            .attr("d", LMe.resizePath);

        brushg.selectAll("rect")
            .attr("height", LMe.timelineHeight - LMe.margin.top)
            .attr("y", LMe.margin.top)
            .attr("x", 0);

        LMe.brush = brush;
        LMe.brushg = brushg;
    };

    //---------------------------------------------------------------
    //---------------------------------------------------------------
    LMe.prepareScatterChart = function () {
        //console.log("preparing the scatter chart");

        //Display all the documents initially
        var LMJsonData = G_DATA_JSON.WORD_DOC_LOAD,
            LScatterChartData,
            LCompeleteChartData,
            LMoreLikeThis,
            SearchWord,
            LPrevYVal = 0;

        var dateparse = d3.time.format("%Y-%m-%dT%H:%M:%SZ");
        LMoreLikeThis = LMJsonData.moreLikeThis;
        SearchWord = LMJsonData.responseHeader.params.q;
        var docArrayofResponce = [];
        var ducumentID = [];
        var MoreLikeTisDoc = [];

        for (var LLoopIndex = 0; LLoopIndex < LMJsonData.response.docs.length; LLoopIndex++) {
            var LDoc = LMJsonData.response.docs[LLoopIndex],
                    LDocumentName = LDoc.label,
                    LDocumentTitle = LDoc.teaser,
                    LSize = LDoc["tf(content,'" + SearchWord + "')"],
                    LEntity_Id = LDoc.entity_id,
                    LDocument_Type = LDoc.sm_field_document_type,
                    LDocument_Subject = LDoc.sm_vid_Document_Subject,
                    LDocumentURL = LDoc.url,
                    LDocScore = LDoc.score,
                    LDocTermFreq = LDoc["termfreq(content,'" + SearchWord + "')"],
                    LDOCTF = LDoc["tf(content,'" + SearchWord + "')"];
            try {
                var LDocumentDate = dateparse.parse(LDoc.publicationDate);

            } catch (e) {
                

            }


            var LDocumentCircleData = {
                Filename: LDocumentName,
                DatePublish: LDocumentDate,
                DocTitle: LDocumentTitle,
                DocLabel: LDocumentTitle,
                DocType: 1,
                index: 1,
                Size: LSize,
                Entity_Id: LEntity_Id,
                BubbleColor: '#6999c9',
                Score: LDocScore,
                DocumentType: LDocument_Type,
                Document_Subject: LDocument_Subject,
                DocumentURL: LDocumentURL,
                TF: LDOCTF,
                TTF: LDocTermFreq
            };

            //Add the frequency data to the date published
            docArrayofResponce.push(LDocumentCircleData);

        }

        for (var LLoopIndex = 0; LLoopIndex < docArrayofResponce.length; LLoopIndex++) {
            var ii = docArrayofResponce[LLoopIndex].Entity_Id;
            ducumentID.push(ii);
        }


        var LUnorderedScatterChartData = docArrayofResponce;
        var LScatterChartData = [],
                    LPrevYVal = 0;
        for (var LLoopIndex = 0; LLoopIndex < LUnorderedScatterChartData.length; LLoopIndex++) {
            var d = LUnorderedScatterChartData[LLoopIndex],
                        LDocumentName = d.Filename,
                        LObj = {};

            //Generate proper document name
            /*LDocumentName = LDocumentName.replace(/\//g, '_');
            LDocumentName = */
            /*'[' + (LLoopIndex + 1) + ']_' +*//* LDocumentName + '.txt';*/

            //Get Y co-ordinate for the document
            var LHeightRange = LMe.height - LMe.timelineHeight - LMe.margin.bottom - LMe.margin.top - 30;
            var LY = Math.floor((Math.random() * (LHeightRange)) + 1);
            if (LY < (50)) {
                LY = 50;
            }

            if ((LY < (LPrevYVal + 30)) && (LY > (LPrevYVal - 30))) {
                //The previous circle and this circle might overlap
                LY = LY + 100;

                if (LHeightRange < LY) {
                    LY = LY - 100;
                }

            }

            LPrevYVal = LY;

            // bring in data from doc_data.json
            LObj.id = LLoopIndex;
            LObj.Filename = LDocumentName;
            LObj.DatePublish = d.DatePublish;
            LObj.DocType = d.DocType;
            LObj.DocTitle = d.DocTitle;
            LObj.keywords = [];
            LObj.keywordOccurances = [];
            LObj.__y = LPrevYVal;
            LObj.LSize = d.Size;
            LObj.BubbleColor = d.BubbleColor;
            LObj.Entity_Id = d.Entity_Id;
            LObj.Score = LDocScore;
            LObj.DocumentType = d.DocumentType;
            LObj.Document_Subject = d.Document_Subject;
            LObj.DocumentURL = d.DocumentURL;
            LObj.TF = d.TF;
            LObj.TTF = d.TTF;
            LScatterChartData.push(LObj);

        }


        LMe.addScatterChartCircle(LScatterChartData);
    };

    //-----Load more like this doc
    LMe.LoadMoreLikethisDoc = function () {

        var LUnorderedScatterChartData = G_DATA_JSON.MoreLikeThisDoc;
        var LScatterChartData = [],
                    LPrevYVal = 0;
        for (var LLoopIndex = 0; LLoopIndex < LUnorderedScatterChartData.length; LLoopIndex++) {
            var d = LUnorderedScatterChartData[LLoopIndex],
                        LDocumentName = d.Filename,
                        LObj = {};

            //Generate proper document name
            /*LDocumentName = LDocumentName.replace(/\//g, '_');
            LDocumentName = */
            /*'[' + (LLoopIndex + 1) + ']_' +*//* LDocumentName + '.txt';*/

            //Get Y co-ordinate for the document
            var LHeightRange = LMe.height - LMe.timelineHeight - LMe.margin.bottom - LMe.margin.top - 30;
            var LY = Math.floor((Math.random() * (LHeightRange)) + 1);
            if (LY < (50)) {
                LY = 50;
            }

            if ((LY < (LPrevYVal + 30)) && (LY > (LPrevYVal - 30))) {
                //The previous circle and this circle might overlap
                LY = LY + 100;

                if (LHeightRange < LY) {
                    LY = LY - 100;
                }

            }

            LPrevYVal = LY;

            // bring in data from doc_data.json
            LObj.id = LLoopIndex;
            LObj.Filename = LDocumentName;
            LObj.DatePublish = d.DatePublish;
            LObj.DocType = d.DocType;
            LObj.DocTitle = d.DocTitle;
            LObj.keywords = [];
            LObj.keywordOccurances = [];
            LObj.__y = LPrevYVal;
            LObj.LSize = d.Size;
            LObj.BubbleColor = d.BubbleColor;
            LObj.Entity_Id = d.Entity_Id;
            LObj.Score = d.Score;
            LObj.DocumentType = d.DocumentType;
            LObj.Document_Subject = d.Document_Subject;
            LObj.DocumentURL = d.DocumentURL;
            LObj.TF = d.TF;
            LObj.TTF = d.TTF;
            LScatterChartData.push(LObj);
        }



        function arrayUnique(array) {

            var a = array.concat();
            for (var i = 11; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i].Entity_Id === a[j].Entity_Id)
                        a.splice(j--, 1);
                }
            }

            return a;
        };

        // Merges both arrays and gets unique items
        //var array3 = arrayUnique(array1.concat(array2));
        //var array3 = arrayUnique(responceDoc.concat(morelikethisdoc));

        var responceDoc = G_DATA_JSON.ResponceDoc;
        var morelikethisdoc = LScatterChartData;
        var AllDoc = arrayUnique(responceDoc.concat(morelikethisdoc));

        // var AllDoc = responceDoc.concat(morelikethisdoc);
        G_DATA_JSON.ResponceMoreLikeDoc = AllDoc;

        LMe.addScatterChartCircle(AllDoc);
    }

    //---------------------------------------------------------------
    LMe.addScatterChartCircle = function (p_data) {


        //Remove association lines if any
        LMe.removeAssociationLines();
        LMe.currentDataChart = p_data;

        var LPrevYVal = 0,
        //We are clonning the array to avoid sorting to the main data list
            LSortedDocumentData = p_data.slice(0);

        LSortedDocumentData.sort(function (a, b) {
            var LDate1 = a.DatePublish,
                LDate2 = b.DatePublish;
            if (LDate1 < LDate2) {
                return 1;
            }
            else if (LDate1 > LDate2) {
                return -1;
            }
            else {
                return 0;
            }
        });

        if (LMe.focussedCircle) {
            //Check if the focussed circle is present in the current data
            var LFound = false;
            for (var LLoopIndex = 0; LLoopIndex < LSortedDocumentData.length; LLoopIndex++) {
                var LObj = LSortedDocumentData[LLoopIndex];
                if (LObj.Filename == LMe.focussedCircle.Filename) {
                    //Document is present in the current data context
                    LFound = true;
                }
            }
        }

        if ((!LFound) || (!isDocTypeSelected(LMe.focussedCircle.DocType))) {
            //LMe.displaySlideInHint();
            var LParam = false;
            if (LMe.focussedCircle) {
                LParam = true;
            }
            LMe.deselectFocussedDocument(LParam);
        }

        var LClear = true;
        if (!LMe.ScatterPlotCircles) LClear = false;

        LMe.scatterChartGroup.selectAll('.document-circles')
            .data(LSortedDocumentData)
            .attr("class", "document-circles")
            .on("mouseover", LMe.documentBubbleHover)
            .on("click", LMe.documentBubbleClick)
            .on("mouseout", LMe.documentBubbleMouseOut)
            .attr("display", function (d) {

                var LIsInSelectedRange = false,
                    LIsVisibleInDocTypeSelected = false;
                var Lx = LMe.x1(d.DatePublish);
                if (Lx < 0 || Lx > (LMe.width - LMe.margin.left - LMe.margin.right)) {
                    // the bubble is out of range
                    LIsInSelectedRange = false
                }
                else {
                    //the bubble is in range
                    LIsInSelectedRange = true;
                }

                if (isDocTypeSelected(d.DocType)) {
                    //doc type is selected
                    LIsVisibleInDocTypeSelected = true
                }

                if (LIsInSelectedRange && LIsVisibleInDocTypeSelected) {
                    return "block";
                }
                else {
                    return "none";
                }
            })
        //.transition().duration(500)
            .attr({
                cx: function (d) {
                    var Lx = LMe.x1(d.DatePublish);
                    if (!LMe.focussedCircle) {
                        return Lx;
                    }

                    var LNotInSelectedRange = (Lx < 0 || Lx > (LMe.width - LMe.margin.left - LMe.margin.right));
                    if ((d.Filename == LMe.focussedCircle.Filename) && (LNotInSelectedRange)) {
                        //Document is present in the current data context
                        LMe.deselectFocussedDocument(true);
                    }
                    return Lx;
                },
                cy: function (d) {

                    if (d.__y) {
                        return d.__y;
                    }

                    var LHeightRange = LMe.height - LMe.timelineHeight - LMe.margin.bottom - LMe.margin.top - 30;
                    var LY = Math.floor((Math.random() * (LHeightRange)) + 1);
                    if (LY < (50)) {
                        LY = 50;
                    }

                    if ((LY < (LPrevYVal + 30)) && (LY > (LPrevYVal - 30))) {
                        //The previous circle and this circle might overlap
                        LY = LY + 100;

                        if (LHeightRange < LY) {
                            LY = LY - 100;
                        }

                    }

                    LPrevYVal = LY;
                    d.__y = LY;
                    return LY;
                },
                r: function (d) { return LMe.getRadiusOfScatterBubble(d); },
                fill: function (d) { return LMe.getBubbleColor(d); },
                stroke: "#6999c9",
                opacity: 0.7,
                /*"stroke-opacity" : 1,*/
                "stroke-width": "1px"
            });

        LMe.scatterChartGroup.selectAll('.document-circles')
            .data(LSortedDocumentData).exit().remove();

        LMe.ScatterPlotCircles = LMe.scatterChartGroup.selectAll('.document-circles')
            .data(LSortedDocumentData);

        //Update the data
        LMe.ScatterPlotCircles.data(LSortedDocumentData);

        LMe.ScatterPlotCircles.enter().append("circle")
            .attr("class", "document-circles")
            .on("mouseover", LMe.documentBubbleHover)
            .on("click", LMe.documentBubbleClick)
            .on("mouseout", LMe.documentBubbleMouseOut)
            .attr("display", function (d) {
                var LIsInSelectedRange = false,
                    LIsVisibleInDocTypeSelected = false;
                var Lx = LMe.x1(d.DatePublish);
                if (Lx < 0 || Lx > (LMe.width - LMe.margin.left - LMe.margin.right)) {
                    // the bubble is out of range
                    LIsInSelectedRange = false
                }
                else {
                    //the bubble is in range
                    LIsInSelectedRange = true;
                }

                if (isDocTypeSelected(d.DocType)) {
                    //doc type is selected
                    LIsVisibleInDocTypeSelected = true
                }

                if (LIsInSelectedRange && LIsVisibleInDocTypeSelected) {
                    return "block";
                }
                else {
                    return "none";
                }
            })
            .attr({
                cx: function (d) { return LMe.x1(d.DatePublish) },
                cy: function (d) {
                    if (d.__y) {
                        return d.__y;
                    }

                    var LHeightRange = LMe.height - LMe.timelineHeight - LMe.margin.bottom - LMe.margin.top - 30;
                    var LY = Math.floor((Math.random() * (LHeightRange)) + 1);
                    if (LY < (50)) {
                        LY = 50;
                    }

                    if ((LY < (LPrevYVal + 30)) && (LY > (LPrevYVal - 30))) {
                        //The previous circle and this circle might overlap
                        LY = LY + 100;

                        if (LHeightRange < LY) {
                            LY = LY - 100;
                        }

                    }

                    LPrevYVal = LY;
                    d.__y = LY;
                    return LY;
                },
                r: 0,
                fill: function (d) { return LMe.getBubbleColor(d); },
                stroke: "#6999c9",
                opacity: 0.7,
                /*"stroke-opacity" : 1,*/
                "stroke-width": "1px"
            })
            .transition().duration(1000).attr("r", function (d) { return LMe.getRadiusOfScatterBubble(d); });

        //change the count of total documents
        //var LTxt = LSortedDocumentData.length + " document results";
        var LTxt = "";
        LMe.scatterChartText.text(LTxt);

        //Check if there is central document selected
        //LMe.generateTimeLineViewForCentralCircle()
        if (!LMe.focussedCircle) {
            //focussed circel is not present
            return;
        }

        setTimeout(function () {
            LMe.timeLineViewDrawAssociationLines();
        }, 0)
    };

    //------------Bubble Color

    LMe.getBubbleColor = function (d) {
        return d.BubbleColor;

    }


    //---------------------------------------------------------------
    LMe.deselectFocussedDocument = function (p_showHint) {
        if (p_showHint === true) {
            LMe.displaySlideInHint("The selected document has been filtered out.");
        }

        LMe.focussedCircle = null;
        LMe.hideOuterCircleForFocussedCircle();

        //Clear the loaded document
        LMe.clearLoadedDocument();

        //hide the slider
        LMe.hideSlider();
    };

    //---------------------------------------------------------------
    LMe.timeLineViewDrawAssociationLines = function () {

        //getDocumentAssociationData();
        //Central circle is present so draw time lines
        // getDocumentAssociationMatrixData123(function (p_assocData) {

        var LCenterCircleData = LMe.focussedCircle;
        var DocEntity_ID = LCenterCircleData.Entity_Id;

        getDocumentAssociationData(DocEntity_ID, function (fn) {

            var LDocCol;
            var LCenterCircleData = LMe.focussedCircle,
                LCenterCircle;
            //Get the central circle
            LMe.ScatterPlotCircles.each(function (d) {
                if (d.Filename == LCenterCircleData.Filename) {
                    LCenterCircle = this;
                }
            });

            var LCentralDocName = d3.select(LCenterCircle).data()[0].Filename;

            var LCentralDocNameTest = d3.select(LCenterCircle).data()[0].Entity_Id;

            var //LIndex = libGetIndexOfWord(LDocCol, LCentralDocName),
                LAssociationDataArr = [],
                LX1 = d3.select(LCenterCircle).attr("cx"),
                LY1 = d3.select(LCenterCircle).attr("cy");
            var count = 0;

            //Travers all document circles and associate them with clicked circle
            LMe.ScatterPlotCircles.each(function (d) {

                var LTargetCircle = this;
                if (LCentralDocName == d.Filename) {
                    d3.select(this).attr({
                        fill: "#6999c9",
                        stroke: "#FFF",
                        /*"stroke-opacity" : 0.5,*/
                        //                        "stroke-width":"10px",
                        opacity: 1/*,
                        r : 20*/
                    });

                    //Create an outer circle for stoke white
                    LMe.displayOuterCircleForFocussedCircle(this);

                    //Any document can not be associated with itself
                    return;
                }

                if (d3.select(this).attr("display") == "none") {
                    //The bubble is not visible
                    return;
                }

                var LX = d3.select(this).attr("cx"),
                    LY = d3.select(this).attr("cy");

                if ((LX < 0) || (LX > (LMe.width - LMe.margin.left - LMe.margin.right))) {
                    //The circle is not present in the visible range
                    return;
                }

                //Circle is present in the visible range
                //display the association
                //var LAssocValue = LDocCol[d.Filename],


                console.log(LCentralDocName + " vs " + d.Filename);

                var LAssocValue = getDissimilarityAssocBetwnDoc(LCentralDocNameTest, count),

                    LObj = {};

                count = count + 1;
                var LDispVal = "block",
                    LLinkVisible = true;


                LObj.value = LAssocValue;
                LObj.x1 = LX1;
                LObj.y1 = LY1;
                LObj.x2 = LX;
                LObj.y2 = LY;
                LObj.visible = LLinkVisible;
                LObj.targetCircle = LTargetCircle;
                LObj.sourceCircle = LCenterCircle;

                LAssociationDataArr.push(LObj);
            });

            //Remove previous links
            LMe.scatterChartGroup.selectAll(".association-links").data([]).exit().remove();

            //Here we have the data for association
            //Now draw association lines
            var LLines = LMe.scatterChartGroup.selectAll(".association-links").data(LAssociationDataArr);

            //add new links
            LLines.enter().append("line")
                .attr("class", "association-links")
                .attr("x1", function (d) { return d.x1; })
                .attr("y1", function (d) { return d.y1; })
                .attr("x2", function (d) { return d.x2; })
                .attr("y2", function (d) { return d.y2; })
                 .attr("opacity", function (d) { return (d.value); })
            //                .attr("opacity", function (d) { return (1 - d.value); })
                .style("display", function (d) {
                    if ((1 - d.value) <= G_DOC_ASSOCIATION_THREASHOLD) {
                        return "none";
                    }
                    else {
                        return "block";
                    }
                });

            LMe.associationLines = LLines;
        });
    };

    //---------------------------------------------------------------
    //---------------------------------------------------------------
    //---------------------------------------------------------------
    LMe.getRadiusOfScatterBubble = function (d, p_ForKeyword) {
        return d.LSize;

    };



    //---------------------------------------------------------------
    LMe.addKeyWordToGraph = function (p_Keyword) {

        LoadJsonData(p_Keyword, function (p_assocData) {

            LMe.DateValue();

            LMe.initializeTimeLine();
            //Draw the frequency data line for a keyword

            LMe.drawKeywordFreqChartForKeyword(p_Keyword);
            delete LMe.frequencyChartLinesData[p_Keyword];
            //add documents circle contaning the keyword
            //LMe.addDocumentCirclesForKeyword(p_Keyword);

            LMe.prepareScatterChart();
            LMe.keywordList.push(p_Keyword);
            console.log(LMe.keywordList);

            
            LMe.switchViewToTimelineView();
            
            //LMe.addScatterChartCircle(p_Keyword);
            //LMe.generateTimeLineViewForCentralCircle();
            /*if(! LMe.focussedCircle)
            {
            //There is no centered circle
            return;
            }*/
            //            debugger;
            //            LMe.documentViewMode == "timeline_view";
            //            //There is a centered circle
            //            if (LMe.documentViewMode == "timeline_view") {
            //                //Documents are in timeline view
            //                //update the timeline view
            //                LMe.generateTimeLineViewForCentralCircle();
            //            }
            //            else if (LMe.documentViewMode == "association_view") {
            //                //Documents are in association view
            //                LMe.generateAssociationViewForCentralCircle();
            //            }
        });
    };



    //---------------------------------------------------------------
    LMe.documentBubbleHover = function (d) {

        console.log(d);
        var LHTML = '';

        LHTML += '<div class="title">' + d.Filename + '</div>';
        LHTML += '<div class="doc-date">' +
            d.DatePublish +
            ' | ' +
        //getDocumentTypeTitle(d.DocType) +
            d.DocumentType[0] +
            '</div>';


        //Get comma seperated keywords

        if (d.Document_Subject != undefined) {
            var LKeyowrdsStr = '';
            for (var LLoopIndex = 0; LLoopIndex < d.Document_Subject.length; LLoopIndex++) {
                LKeyowrdsStr += d.Document_Subject[LLoopIndex];

                if (LLoopIndex < d.Document_Subject.length - 1) {
                    LKeyowrdsStr += ', ';
                }
            }

            LHTML += '<div class="doc-date"></br>' + LKeyowrdsStr + '</div>';
        }
        //        LHTML += '<div class="TF"></br>' + d.TF + '</div>';
        //        LHTML += '<div class="TTF"></br>' + d.TTF + '</div>';

        LHTML += '  <div id="textbox"><p class="alignleft">' + d.TF + '</p><p class="alignright">' + d.TTF + '</p></div>';

        LHTML += '<div class="content-keyword-str"></br></br></br></br>' + d.DocTitle + '</div>';

        d3.select("#tooltip .tooltip-html").html(LHTML);

        var currHeight = $('#tooltip').height(),
            LPageY = d3.event.pageY,
            LPageX = d3.event.pageX;

        var LToolTipTop = LPageY - currHeight - 40,
            LToolTipLeft = LPageX - 150;
        if (LToolTipTop < 0) {
            //tooltip is going out of screen
            LToolTipTop = LPageY;
        }


        if (LToolTipLeft < 0) {
            LToolTipLeft = 30;
        }
        if (LToolTipLeft > 900) {
            LToolTipLeft = 850;
        }
        LMe.tooltip.style("top", LToolTipTop + "px")
            .style("left", LToolTipLeft + "px");

        LMe.tooltip.style("visibility", "visible");
    };

    //---------------------------------------------------------------
    LMe.documentBubbleMouseOut = function (d) {
        LMe.tooltip.style("visibility", "hidden");
        //        d3.select(this).transition().duration(500).style("fill",LMe.originalColor);

    };

    //---------------------------------------------------------------
    LMe.documentBubbleClick = function (d) {

        var LSlider = d3.select(".doc-assoc-slider-cntnr");

        if (LMe.focussedCircle) {
            if (LMe.focussedCircle.Filename == d.Filename) {
                //The clicked circle is same as the central circle
                //remove the view
                LMe.focussedCircle = null;

                //Clear the loaded document
                LMe.clearLoadedDocument();

                //hide the slider
                LMe.hideSlider();

                if (LMe.documentViewMode == "timeline_view") {
                    //The visualization is in timeline view
                    //Remove all the associations
                    //LMe.removeAssociationLines();

                    LMe.addScatterChartCircle(LMe.currentDataChart);

                    //LMe.onBubbleChnage(d.Entity_Id);
                }
                else if (LMe.documentViewMode == "association_view") {

                    LMe.switchViewToTimelineView();
                    LMe.removeAssociationLines();
                }

                LMe.displaySlideInHint("The document has been unselected.");
                return;
            }

        }

        LMe.focussedCircle = d;
        if (LMe.documentViewMode == "timeline_view") {

            LMe.generateTimeLineViewForCentralCircle();

            //LMe.onBubbleChnage(d.Entity_Id);
        }
        else if (LMe.documentViewMode == "association_view") {

            LMe.generateAssociationViewForCentralCircle();
        }

        //show the slider
        LMe.showSlider();

        LMe.displayDocumentDetails(d);
        LMe.displaySlideInHint("A new document has been selected.");
    };

    //---------------------------------------------------------------
    LMe.generateTimeLineViewForCentralCircle = function (p_recomputedata) {

        if (p_recomputedata == true) {

            //compute the data and also draw the chart again
            LMe.prepareScatterChart();
        }
        else {

            //Redraw the data with current data
            LMe.addScatterChartCircle(LMe.currentDataChart);
        }

        /*if(! LMe.focussedCircle)
        {
        //There is no center circle
        return;
        }

        getDocumentAssociationMatrixData(function(p_assocData){
        var LDocCol;
        var LCenterCircleData = LMe.focussedCircle,
        LCenterCircle;
        //Get the central circle
        LMe.ScatterPlotCircles.each(function(d){
        if(d.Filename == LCenterCircleData.Filename)
        {
        LCenterCircle = this;
        }
        });

        var LCentralDocName = d3.select(LCenterCircle).data()[0].Filename;

        //Get column for the document
        for(var LLoopIndex = 0; LLoopIndex < p_assocData.length; LLoopIndex++)
        {
        var LColumn = p_assocData[LLoopIndex];
        if(LColumn[""] == LCentralDocName)
        {
        LDocCol = LColumn;
        break;
        }
        }
        var LIndex = libGetIndexOfWord(LDocCol, LCentralDocName),
        LAssociationDataArr = [],
        LX1 = d3.select(LCenterCircle).attr("cx"),
        LY1 = d3.select(LCenterCircle).attr("cy");

        //Travers all document circles and associate them with clicked circle
        LMe.ScatterPlotCircles.each(function(d){
        var LTargetCircle = this;
        if(LCentralDocName == d.Filename)
        {
        //Any document can not be associated with itself
        return;
        }

        var LX = d3.select(this).attr("cx"),
        LY = d3.select(this).attr("cy");
        if((LX < 0) || (LX > (LMe.width - LMe.margin.left - LMe.margin.right)))
        {
        //The circle is not present in the visible range
        return;
        }

        //Circle is present in the visible range
        //display the association
        var LAssocValue = LDocCol[d.Filename],
        LObj = {};

        LObj.value = LAssocValue;
        LObj.x1 = LX1;
        LObj.y1 = LY1;
        LObj.x2 = LX;
        LObj.y2 = LY;
        LObj.targetCircle = LTargetCircle;
        LObj.sourceCircle = LCenterCircle;

        LAssociationDataArr.push(LObj);
        });

        //Remove previous links
        LMe.scatterChartGroup.selectAll(".association-links").data([]).exit().remove();

        //Here we have the data for association
        //Now draw association lines
        var LLines = LMe.scatterChartGroup.selectAll(".association-links").data(LAssociationDataArr);
        //remove old links
        //LLines.exit().remove();
        //add new links
        LLines.enter().append("line")
        .attr("class", "association-links")
        .attr("x1", function(d){ return d.x1; })
        .attr("y1", function(d){ return d.y1; })
        .attr("x2", function(d){ return d.x2; })
        .attr("y2", function(d){ return d.y2; })
        .style("display", function(d){
        if(d.value < G_DOC_ASSOCIATION_THREASHOLD)
        {
        return "none";
        }
        else
        {
        return "block";
        }
        });

        LMe.associationLines = LLines;
        }); */
    };

    //---------------------------------------------------------------
    LMe.generateAssociationViewForCentralCircle = function () {


        var LCenterCircleData = LMe.focussedCircle;
        var DocEntity_ID = LCenterCircleData.Entity_Id;
        getDocumentAssociationData(DocEntity_ID, function (p_assocData) {
            //-------------------------------

            var LAssociationViewData = [],
                LLinks = [],
                LIndex = 0,
                LSourceIndex = 0,
                LfoccusedDocData = LMe.focussedCircle,
                LFocussedCircle,
                LFocusedDocEntityID = LfoccusedDocData.Entity_Id;

            //var LForceHt = (LMe.timelineHeight + (LMe.height - LMe.timelineHeight)/2) * 2,
            var LForceHt = ((LMe.height - LMe.timelineHeight) / 2) * 2,
                LForceWd = LMe.width - LMe.margin.left - LMe.margin.right,
                LCenterX = LForceWd / 2,
                LCenterY = LForceHt / 2,
                LLinkDst = LForceWd;
            LLinkDst = LLinkDst / 2;

            LMe.drawAssociationLines();
            LMe.displayAssociationScalesCircles();

            var LFocussedNodeIsVisible = false;
            //Get data for bubbles
            LMe.ScatterPlotCircles.each(function (d) {
                var LCircle = d3.select(this);
                LCircle.attr("display", "none");
                var LDate = d.DatePublish,
                    Lx = LMe.x1(LDate),
                    Ly = LCircle.attr("cy");
                if (Lx < 0 || Lx > (LMe.width - LMe.margin.left - LMe.margin.right)) {
                    return;
                }

                if (!isDocTypeSelected(d.DocType)) {
                    //Document type is not selected
                    return;
                }

                if (LfoccusedDocData) {
                    if (LfoccusedDocData.Filename == d.Filename) {
                        LFocussedNodeIsVisible = true;
                        LSourceIndex = LIndex;
                    }
                }
                else {
                    LFocussedNodeIsVisible = false;
                }

                d._x = Lx;
                d._y = Ly;
                LAssociationViewData.push(d);
                LIndex++;
            });

            if (!LFocussedNodeIsVisible) {
                //The focussed node is not visible in the context
                //switch the mode
                LMe.force.stop();
                LMe.displaySlideInHint("The selected document has been filtered out.");
                LMe.switchViewToTimelineView();
                return;
            }

            //Get data for links
            for (var LLoopIndex = 0; LLoopIndex < LAssociationViewData.length; LLoopIndex++) {
                var LDocCol,
                    LBubble = LAssociationViewData[LLoopIndex];

                var LValue = LAssocValue = getDissimilarityAssocBetwnDoc(LFocusedDocEntityID, LLoopIndex);
                LBubble.associationVal = LValue;
                var LObj = { "source": LSourceIndex, "target": LLoopIndex, "value": LValue };
                LLinks.push(LObj);
            }
            var LCenterCircle;
            if (!LMe.force) {
                //LLinkDst = (1 - G_DOC_ASSOCIATION_THREASHOLD) * LLinkDst;
                LMe.force = d3.layout.force()
                    .gravity(.05)
                    .distance(100)
                //.linkDistance(function(d) { return LLinkDst * (d.value) })
                    .charge(-100)
                    .size([LForceWd, LForceHt]);

                LMe.force.on("tick", function (e) {
                    LMe.associationViewNodes
                        .attr("cx", function (d) {
                            if ((LMe.focussedCircle) && (d.Filename == LMe.focussedCircle.Filename)) {
                                d.x = LCenterX;
                            }

                            return d.x = Math.max(20, Math.min(LForceWd - 20, d.x));
                            //return d.x;
                        })
                        .attr("cy", function (d) {
                            if ((LMe.focussedCircle) && (d.Filename == LMe.focussedCircle.Filename)) {
                                //d.fixed = true;
                                d.y = LCenterY;
                                LMe.displayOuterCircleForFocussedCircle(this, true);
                            }
                            return d.y = Math.max(20, Math.min(LForceHt - 50, d.y));
                            //return d.y;
                        });

                    LMe.link.attr("x1", function (d) {
                        return d.source.x;
                    })
                        .attr("y1", function (d) {
                            return d.source.y;
                        })
                        .attr("x2", function (d) { return d.target.x; })
                        .attr("y2", function (d) { return d.target.y; });

                });
            }

            LLinkDst = LLinkDst / (1 - G_DOC_ASSOCIATION_THREASHOLD);
            LMe.force
                .nodes(LAssociationViewData)
                .links(LLinks)
                .linkDistance(function (d) { return LLinkDst * (d.value) })
                .start();

            LMe.scatterChartGroup.selectAll(".link")
                .data([]).exit().remove();

            LMe.link = LMe.scatterChartGroup.selectAll(".link")
                .data(LLinks)
                .enter().append("line")
                .attr("class", "link document-assos-line");

            LMe.svg.selectAll(".node")
                .data([]).exit().remove();

            //LMe.LCenterCircle = null;

            LMe.associationViewNodes = LMe.scatterChartGroup.selectAll(".node")
                .data(LAssociationViewData)
                .enter().append("circle")
                .attr("class", "node document-circles-assoc")
                .attr("display", function (d) {

                    if (LfoccusedDocData.Filename == d.Filename) {
                        LCenterCircle = this;
                        return "block";
                    }

                    if ((1 - d.associationVal) < G_DOC_ASSOCIATION_THREASHOLD) {
                        return "none";
                    }
                    else {
                        return "block";
                    }
                })
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .style("opacity", function (d) {
                    var LOpacity = 1 - d.associationVal;
                    if (LOpacity == 0) {
                        LOpacity = 1;
                    }
                    return LOpacity;
                })
                .attr("r", function (d) {
                    if (d.Filename == LfoccusedDocData.Filename) {
                        d.fixed = true;
                        d3.select(this).attr({
                            fill: "#6999c9",
                            stroke: "#fff",
                            /*"stroke-opacity" : 0.5,*/
                            //                            "stroke-width":"10px",
                            opacity: 1/*,
                            r : 20*/
                        });
                        return LMe.getRadiusOfScatterBubble(d);
                    }
                    d.fixed = false;
                    return LMe.getRadiusOfScatterBubble(d);
                })
                .attr("fill", function (d) {
                    //                    if (d.Filename == LfoccusedDocData.Filename) {
                    //                        return "#D4BE56";
                    //                    }

                    //                    if (d.associationVal == 1) {
                    //                        return "transparent";
                    //                    }

                    return d.BubbleColor;
                })
                .attr("stroke", function (d) {
                    if (d.Filename == LfoccusedDocData.Filename) {
                        return "#FFF";
                    }

                    if (d.associationVal == 1) {
                        return "#FFFFFF";
                    }

                    return "#FFF";
                })
                .on("mouseover", LMe.documentBubbleHover)
                .on("click", LMe.documentBubbleClick)
                .on("mouseout", LMe.documentBubbleMouseOut)
                .call(LMe.force.drag);

            LMe.displayOuterCircleForFocussedCircle(LCenterCircle, true);
        });
    };

    //---------------------------------------------------------------
    LMe.removeKeywordFromGraph = function (p_Keyword) {
        //Draw the frequency data line for a keyword

        G_DATA_JSON.WORD_DOC_LOAD = null;
        //LMe.drawKeywordFreqChartForKeyword(p_Keyword);

        //LMe.initializeTimeLine();
        delete LMe.frequencyChartLinesData[p_Keyword];
        //LMe.frequencyChartLinesData= null;
        LMe.updateKeywordFrequencyLines();

        //add documents circle contaning the keyword
        LMe.removeDocumentCirclesForKeyword(p_Keyword);

        var LIndex = libGetIndexOfWord(LMe.keywordList, p_Keyword);
        LMe.keywordList.splice(LIndex, 1);

        if (LMe.keywordList.length == 0) {
            //There are no keywords selected
            //display all the documents
            if (LMe.documentViewMode == "association_view") {
                LMe.switchViewToTimelineView();
            }

            //LMe.prepareScatterChart();
            return;
        }
        if (!LMe.focussedCircle) {
            //There is no centered circle
            //LMe.displaySlideInHint();
            LMe.switchViewToTimelineView();
            return;
        }

        //There is a centered circle
        if (LMe.documentViewMode == "timeline_view") {
            //Documents are in timeline view
            //update the timeline view
            LMe.generateTimeLineViewForCentralCircle();
        }
        else if (LMe.documentViewMode == "association_view") {
            //Documents are in association view
            LMe.generateAssociationViewForCentralCircle();
        }
    };

    //---------------------------------------------------------------
    LMe.removeDocumentCirclesForKeyword = function (p_Keyword) {
        var LDocsData = G_DATA_JSON.DOC_DATA,
            LWordsTotalFreqData = G_DATA_JSON.WORD_TOTAL,
            LWordsFreqPerDocData = G_DATA_JSON.WORD_FREQ_PER_DOC,
            LScatterChartData;

        LScatterChartData = LMe.ScatterPlotCircles.data();

        //LScatterChartData = LMe.scatterChartGroup.selectAll('.document-circles').each(function(){});
        for (var LLoopIndex = 0; LLoopIndex < LScatterChartData.length; LLoopIndex++) {
            var d = LScatterChartData[LLoopIndex],
                LIndexOfKeyword = libGetIndexOfWord(d.keywords, p_Keyword);
            if (LIndexOfKeyword != -1) {
                //Keyword did not exist in the current document
                continue;
            }

            //Keyword exists in the document
            d.keywords.splice(LIndexOfKeyword, 1);
            d.keywordOccurances.splice(LIndexOfKeyword, 1);

            if (d.keywords.length == 0) {
                //there are no other keywords which exist in the document
                //remove this entry
                LScatterChartData.splice(LLoopIndex, 1);
                //the data is shifted to one less than the current index
                LLoopIndex--;
            }
        }

        LMe.addScatterChartCircle(LScatterChartData);
    };

    //---------------------------------------------------------------
    LMe.drawKeywordFreqChartForKeyword = function (p_Keyword) {

        function L_GetDataForGeneratingLine() {

            var LMTest = G_DATA_JSON.WORD_DOC_LOAD,
                LResult = [];


            var LKeywordIndexTest = LMTest.facet_counts.facet_dates.publicationDate;

            var dateparse = d3.time.format("%Y-%m-%dT%H:%M:%SZ");
            var myData, dataArray, key;

            dataArray = [];

            for (key in LKeywordIndexTest) {
                var test = {

                    Date: dateparse.parse(key),
                    Value: LKeywordIndexTest[key]
                }
                if (test.Date != null) {
                   
                    dataArray.push(test);
                }
                //                dataArray.push(test);
            }


            var dataArrayTest = [];

            for (var LLoopIndex = 0; LLoopIndex < dataArray.length; LLoopIndex++) {

                var LDoc = dataArray[LLoopIndex],
                     LDocumentDateTest = LDoc.Date,
                     LDocumentDateOccranceTest = LDoc.Value;
                var LFreqDataTest = {
                    keywordOccurance: LDocumentDateOccranceTest,
                    datePublish: LDocumentDateTest

                };

                //Add the frequency data to the date published
                dataArrayTest.push(LFreqDataTest);

            }
            return dataArrayTest;
        }


        var LLineData = L_GetDataForGeneratingLine();
        LMe.frequencyChartLinesData[p_Keyword] = LLineData;
        LMe.updateKeywordFrequencyLines();
    };

    //---------------------------------------------------------------
    LMe.updateKeywordFrequencyLines = function () {

        var LMin = 0,
            LMax = 0;
        //-----
        function L_GetLinesData() {
            var LResult = [];
            for (var LKeyword in LMe.frequencyChartLinesData) {
                var LData = LMe.frequencyChartLinesData[LKeyword];
                LResult.push(LData);
            }

            return LResult;
        }
        //-----

        if (!LMe.line) {
            //Line object is not defined
            LMe.line = d3.svg.line()
            // assign the X function to plot our line as we wish
                .x(function (d, i) {
                    // verbose logging to show what's actually being done
                    //console.log('Plotting X value for date: ' + d.date + ' using index: ' + i + ' to be at: ' + x(d.date) + ' using our xScale.');
                    // return the X coordinate where we want to plot this datapoint
                    //return x(i);

                    // return LMe.x(LMe.dateFormat.parse(d.datePublish));

                    return LMe.x(d.datePublish);
                })
                .y(function (d) {
                    // verbose logging to show what's actually being done
                    //console.log('Plotting Y value for data value: ' + d.value + ' to be at: ' + y(d.value) + " using our yScale.");
                    // return the Y coordinate where we want to plot this datapoint
                    //return y(d);
                    //var LYValue = d.keywordOccurance/ d.keywordTotalOccurance;

                    var LYValue = +d.keywordOccurance;
                    return LMe.y(LYValue);
                })
            //                .interpolate("cardinal");
                .interpolate("linear");
        }

        var LLinesData = L_GetLinesData();

        LMin = d3.min(LLinesData, function (d) {
            return d3.min(d, function (d1) {
                return d1.keywordOccurance;
            });
        });
        LMax = d3.max(LLinesData, function (d) {
            return d3.max(d, function (d1) {
                return d1.keywordOccurance;
            });
        });

        LMe.y.domain([LMin, LMax]);
        //        d3.select('#' + LMe.svgId).select(".y").call(LMe.yAxis);

        LMe.svg.selectAll(".timeline-path-group")
            .data([]).exit().remove();

        LMe.dataLines = LMe.svg.selectAll('.data-line-pseudo')
            .data(LLinesData);

        var Lgx = LMe.margin.left + 10,
            Lgy = LMe.margin.top;


        var dateparse = d3.time.format("%Y-%m-%dT%H:%M:%SZ");
        LMe.dataLines
            .enter()
            .append('svg:g')
            .attr("class", "timeline-path-group")
            .attr("transform", "translate(" + Lgx + ", " + Lgy + ")")
            .append('path')
            .attr('class', 'data-line')
            .style("stroke", "#ccc")
            .style('opacity', 1)
            .attr("d", function (d) {
                d.sort(function (a, b) {


                    //                    var LDate1 = LMe.dateFormat.parse(a.datePublish),
                    //                        LDate2 = LMe.dateFormat.parse(b.datePublish);

                    var LDate1 = a.datePublish,
                        LDate2 = b.datePublish;
                    if (LDate1 < LDate2) {
                        return 1;
                    }
                    else if (LDate1 > LDate2) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
                return LMe.line(d)
            });
    };

    //---------------------------------------------------------------
    LMe.drawGraph = function (p_ChartData) {
        var LCompleteJoinedData = [];
        for (var LLoopIndex = 0; LLoopIndex < p_ChartData.length; LLoopIndex++) {
            var LKeywordData = p_ChartData[LLoopIndex];
            LCompleteJoinedData = LCompleteJoinedData.concat(LKeywordData.data);
        }
        LMe.drawGraphScales(LCompleteJoinedData);

        LMe.dataLinesCollection = [];
        for (var LLoopIndex = 0; LLoopIndex < p_ChartData.length; LLoopIndex++) {
            var LKeywordData = p_ChartData[LLoopIndex],
                LFillColor = LMe.color1(LLoopIndex);
            LMe.drawAreaChart(LKeywordData, LFillColor);
        }


        var brush = d3.svg.brush()
            .x(LMe.x)
        /*.extent([LMe.dateFormat.parse(LMe.DateMax),
        LMe.dateFormat.parse(LMe.DateMin)])*/
            .on("brush", LMe.handleOnBrush)
        //.on("brushend", LMe.handleOnBrush);

        var brushg = LMe.timelineGroup.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(" + LMe.margin.left + ",0)")
            .call(brush);

        brushg.selectAll(".resize").append("path")
            .attr("transform", "translate(0," + LMe.timelineHeight / 6 + ")")
            .attr("d", LMe.resizePath);

        brushg.selectAll("rect")
            .attr("height", LMe.timelineHeight)
            .attr("y", 0)
            .attr("x", 0);

        LMe.brush = brush;
        LMe.brushg = brushg;

        /*var gBrush = LMe.timelineGroup.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("x", LMe.margin.left)
        .attr("height", LMe.timelineHeight);

        //attr("class", "brush").call(brush);
        gBrush.selectAll(".resize").append("path").attr("d", LMe.resizePath);*/

    }

    //---------------------------------------------------------------
    LMe.resizePath = function (d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = 250 / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
    };


    //--------------------------Date initialize

    LMe.DateValue = function () {

        var LMTest = G_DATA_JSON.WORD_DOC_LOAD,
                LResult = [];


        var LKeywordIndexTest = LMTest.facet_counts.facet_dates.publicationDate;

        var dateparse = d3.time.format("%Y-%m-%dT%H:%M:%SZ");
        var myData, dataArray, key;

        dataArray = [];

        for (key in LKeywordIndexTest) {
            var test = {

                Date: dateparse.parse(key),
                Value: LKeywordIndexTest[key]
            }

            dataArray.push(test);
        }


        var dataArrayTest = [];

        for (var LLoopIndex = 0; LLoopIndex < dataArray.length; LLoopIndex++) {

            var LDoc = dataArray[LLoopIndex],
                     LDocumentDateTest = LDoc.Date,
                     LDocumentDateOccranceTest = LDoc.Value;
            var LFreqDataTest = {
                keywordOccurance: LDocumentDateOccranceTest,
                datePublish: LDocumentDateTest

            };

            //Add the frequency data to the date published
            dataArrayTest.push(LFreqDataTest);

        }

        G_DATA_JSON.DOC_Date = dataArrayTest;


    }
    //---------------------------------------------------------------
    LMe.drawGraphScales = function () {
        var Lmax = 100,
            Lmin = 0;

        //create group for time line
        LMe.timelineGroup = LMe.svg
            .append('g')
            .classed("time-line-group", true)
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        //create group for time line
        LMe.scatterChartGroup = LMe.svg
            .append('g')
            .classed("scatter-chart-group", true)
            .attr("transform", "translate(" + (LMe.margin.left + 10) + "," + LMe.timelineHeight + ")");


        //Add a rect to show background color
        LMe.timelineGroup
            .append("rect")
            .attr("class", "time-line-bg")
            .attr("width", LMe.timelineWidth)
            .attr("height", LMe.timelineHeight);

        //Add a title for the scales
        LMe.timelineGroup
            .append("text")
            .attr("class", "timeline-info-text")
            .text("FREQUENCY of selected keywords in corpus")
            .attr("x", LMe.margin.left + 10 + 10)
            .attr("y", LMe.margin.top + 7);

        var LDateMax = d3.min(["17-Aug-06", "20-Dec-12"], function (d) {
            return d
        }),
            LDateMin = d3.max(["17-Aug-06", "20-Dec-12"], function (d) {
                return d.datePublish
            });

        LMe.DateMax = LDateMax;
        LMe.DateMin = LDateMin;

        //        var x = d3.time.scale().range([0, LMe.timelineWidth - LMe.margin.left - 10 - LMe.margin.right]);
        //        x.domain(d3.extent(G_DATA_JSON.DOC_DATA.map(function (d) { return LMe.dateFormat.parse(d.DatePublish); })));
        //        var xAxis = d3.svg.axis().scale(x).orient('bottom').tickSize(0).tickPadding(5);

        //        var x1 = d3.time.scale().range([0, LMe.timelineWidth - LMe.margin.left - 10 - LMe.margin.right]);
        //        x1.domain(d3.extent(G_DATA_JSON.DOC_DATA.map(function (d) { return LMe.dateFormat.parse(d.DatePublish); })));
        //        var xAxis1 = d3.svg.axis().scale(x1).orient('bottom').tickSize(0).tickPadding(5);



        var x = d3.time.scale().range([0, LMe.timelineWidth - LMe.margin.left - 10 - LMe.margin.right]);
        x.domain(d3.extent(G_DATA_JSON.DOC_Date.map(function (d) { return d.datePublish; })));
        var xAxis = d3.svg.axis().scale(x).orient('bottom').tickSize(0).tickPadding(5);

        var x1 = d3.time.scale().range([0, LMe.timelineWidth - LMe.margin.left - 10 - LMe.margin.right]);
        x1.domain(d3.extent(G_DATA_JSON.DOC_Date.map(function (d) { return d.datePublish; })));
        var xAxis1 = d3.svg.axis().scale(x1).orient('bottom').tickSize(0).tickPadding(5);

        var LYaxisHt = LMe.timelineHeight - 50;
        var y = d3.scale.linear().range([LYaxisHt, 0]).domain([Lmin, Lmax]);
        var yAxis = d3.svg.axis().scale(y).orient('left').tickSize(0).tickPadding(5); //.tickFormat(LMe.formatPercent);

        var LXAxisXcord = LMe.margin.left + 10,
            LXAxisYcord = LMe.timelineHeight - LMe.margin.bottom - 9,

            LX1AxisXcord = LMe.margin.left + 10,
            LX1AxisYcord = 20,

            LYAxisXcord = LMe.margin.left + 10,
            LYAxisYcord = LMe.margin.top;

        LMe.timelineGroup.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + LYAxisXcord + "," + LYAxisYcord + ")")
            .call(yAxis);

        LMe.timelineGroup.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + LXAxisXcord + "," + LXAxisYcord + ")")
            .call(xAxis);

        /*LMe.scatterChartGroup.append("g")
        .attr("class", "x axis x1")
        .attr("transform", "translate(" + 0 + "," + LX1AxisYcord + ")")
        .call(xAxis1);*/

        LMe.x = x;
        LMe.x1 = x1;
        LMe.y = y;
        LMe.xAxis = xAxis;
        LMe.xAxis1 = xAxis1;
        LMe.yAxis = yAxis;

    };

    //---------------------------------------------------------------
    LMe.drawAreaChart = function (p_KeywordData, p_FillColor) {
        var data = p_KeywordData.data,
            keyword = p_KeywordData.keyword;
        data.sort(function (a, b) {
            var LDate1 = LMe.dateFormat.parse(a.datePublish),
                LDate2 = LMe.dateFormat.parse(b.datePublish);
            if (LDate1 < LDate2) {
                return 1;
            }
            else if (LDate1 > LDate2) {
                return -1;
            }
            else {
                return 0;
            }
        });

        var garea = d3.svg.area()
            .interpolate("linear")
            .x(function (d) {
                // verbose logging to show what's actually being done
                return LMe.x(LMe.dateFormat.parse(d.datePublish));
            })
            .y0(LMe.timelineHeight - LMe.margin.top - LMe.margin.bottom - 10)
            .y1(function (d) {
                // verbose logging to show what's actually being done
                return LMe.y(d.keywordOccurance);
            });

        var LAreaX = LMe.margin.left + 1,
            LAreaY = LMe.margin.top;

        var LMapGroup = LMe.timelineGroup
            .append('g')
            .attr('transform', 'translate(' + LAreaX + ',' + LAreaY + ')');

        var dataLines = LMapGroup.selectAll('.data-line')
            .data(data);
        dataLines
            .enter()
            .append('svg:path')
            .datum(keyword)
            .style('fill', '#888888')
            .style('fill-opacity', '0.5')
            .attr("class", "area")
            .attr("d", garea(data))
        /*.on("mouseover", function(d){
        //Highlight the circles for word
        LMe.highlightDocCircles(d);
        })*/;

        LMe.dataLinesCollection.push(dataLines);

    }

    //---------------------------------------------------------------
    LMe.handleOnBrush = function () {
        ///var LBrushExtend = LMe.brush.extend();

        var LBrushExtend = LMe.brush.extent(),
        LLowerDate = LBrushExtend[0],
        LUpperDate = LBrushExtend[1];

        LMe.x1.domain(LMe.brush.empty() ? LMe.x.domain() : LMe.brush.extent());
        d3.select('#' + LMe.svgId).select(".x1").call(LMe.xAxis1);
        //LMe.displayBubblesInTheRange(LLowerDate, LUpperDate);

        if (LMe.documentViewMode == "timeline_view") {
            LMe.generateTimeLineViewForCentralCircle();
        }
        else if (LMe.documentViewMode == "association_view") {
            LMe.generateAssociationViewForCentralCircle();
        }

        /*if(LMe.associationLines)
        {
        //If there are lines drawn update the lines
        LMe.associationLines.each(function(d){
        var LLine = d3.select(this);
        if(d.value < G_DOC_ASSOCIATION_THREASHOLD)
        {
        LLine.style("display", "none");
        }
        else
        {
        LLine.style("display", "block");
        }

        d.x1 = d3.select(d.sourceCircle).attr("cx");
        d.y1 = d3.select(d.sourceCircle).attr("cy");
        d.x2 = d3.select(d.targetCircle).attr("cx");
        d.y2 = d3.select(d.targetCircle).attr("cy");
        LLine
        .attr("x1", function(d){ return d.x1; })
        .attr("y1", function(d){ return d.y1; })
        .attr("x2", function(d){ return d.x2; })
        .attr("y2", function(d){ return d.y2; });

        });
        } */
    };

    //---------------------------------------------------------------
    LMe.drawVerticalLines = function () {
        var rule = d3.select("#" + LMe.svgId).selectAll("g.rule")
            .data(LMe.x1.ticks(10))
            .enter().append("svg:g")
            .attr("class", "rule")
            .attr("transform", function (d) { return "translate(" + (LMe.x1(d) + LMe.margin.left) + "," + "0" + ")"; });

        rule.append("svg:line")
            .attr("y1", LMe.height - LMe.timelineHeight - LMe.margin.top - 30)
            .style("stroke", function (d) { return "#AAAAAA"; })
            .style("stroke-dasharray", '9, 3, 5')
            .style("stroke-opacity", function (d) { return 0.5; })

        rule.append("svg:text")
        //.attr("dx", '20px')
            .attr("dy", "10px")
            .attr("class", "grid-text")
            .attr("fill", "#AAAAAA")
            .attr("transform", "rotate(90)")
            .attr("transform-origin", "0 0")
            .text(function (d) {
                return LMe.dateFormat(d)
            });
    }

    //---------------------------------------------------------------
    LMe.drawDocumentScatterChart = function (p_Data) {
        //Generate data for scatter chart
        var LScatterChartData = LMe.generateDataForScatterChart(p_Data); //LMe.ScatterPlotCircles.data();

        LMe.ScatterPlot = d3.select("#" + LMe.svgId).append('g');
        LMe.ScatterPlotCircles = LMe.ScatterPlot.selectAll('circle')
            .data(LScatterChartData)
            .enter().append("circle")
            .attr("class", "document-circles")
            .on("mouseover", function (d) {
                d3.select(this).transition().duration(500)
                    .attr("r", "15")
                    .attr("stroke-width", "3");

                LMe.tooltip.style("visibility", "visible");
                d3.select("#tooltip .tooltip-html").html("Loading " + d.documentName + "...");

                var currHeight = $('#tooltip').height(),
                    LPageY = d3.event.pageY,
                    LPageX = d3.event.pageX;

                var LToolTipTop = LPageY - currHeight - 100,
                    LToolTipLeft = LPageX - 150;
                if (LToolTipTop < 0) {
                    //tooltip is going out of screen
                    LToolTipTop = LPageY + 100;
                }
                LMe.tooltip.style("top", +"px")
                    .style("left", LToolTipLeft + "px");

                var LDocURL = "data/txt/" + d.documentName;
                d3.text(LDocURL, function (p_Text) {
                    var LDocTxt = p_Text.substring(0, 120);
                    LDocTxt += '...';

                    //clear the hint
                    var LToolTip = d3.select("#tooltip .tooltip-html").html("");

                    //add title
                    LToolTip.append("div")
                        .attr("class", "title")
                        .text(d.documentName)

                    //add the text content
                    LToolTip.append("div")
                        .attr("class", "content")
                        .text(LDocTxt)

                    /*//add the open document link
                    LToolTip.append("div")
                    .style("text-align", "right")
                    .style("paddin-top", "10px")
                    .append("a")
                    .attr("href", LDocURL)
                    .attr("class", "open-link")
                    .attr("target", "_blank")
                    .text("OPEN DOCUMENT");*/

                    /**/
                    var LHt = $("#tooltip").height();
                    var LToolTipTop = LPageY - LHt - 40,
                        LToolTipLeft = LPageX - 150;
                    if (LToolTipTop < 0) {
                        //tooltip is going out of screen
                        LToolTipTop = LPageY + 30;
                    }

                    LMe.tooltip.style("top", LToolTipTop + "px")
                        .style("left", LToolTipLeft + "px");

                    /*LMe.timoutObj = setTimeout(function(){

                    }, 3000);*/

                });
            })
            .on("click", function (d) {
                d3.select(this).transition().duration(500)
                    .attr("r", "15")
                    .attr("stroke-width", "3");
                LMe.onDocumentBubbleClick(d);
            })
            .on("mouseout", function (d) {
                d3.select(this).transition().duration(500)
                    .attr("r", "10")
                    .attr("stroke-width", "1");

                LMe.tooltip.style("visibility", "hidden");

                //LMe.tooltip.style("visibility", "hidden");
            })
        /*.attr("title", function(d){
        return d.documentName;
        })*/
            .attr({
                cx: function (d) { return LMe.x1(LMe.dateFormat.parse(d.datePublish)) + LMe.margin.left; },
                cy: function (d) {
                    var LY = Math.floor((Math.random() * (LMe.height - LMe.timelineHeight - LMe.margin.bottom - 50)) + 1);
                    if (LY < (LMe.margin.top + 50)) {
                        LY = LMe.margin.top + 50;
                    }
                    return LY;
                },
                r: 10
            });
    }

    //---------------------------------------------------------------
    LMe.generateDataForScatterChart = function (p_Data) {
        //the function  will return a data array to generate the scatter chart
        var LResult = [],
            LMergedArray = [];

        //Traverse the keyword
        for (var LLoopIndex = 0; LLoopIndex < p_Data.length; LLoopIndex++) {
            var LKeywordData = p_Data[LLoopIndex],
                LKeyword = LKeywordData.keyword,
                LData = LKeywordData.data;
            for (var LLoopIndex1 = 0; LLoopIndex1 < LData.length; LLoopIndex1++) {
                var LDocumentData = LData[LLoopIndex1],
                    LDocumentName = LDocumentData.documentName,
                    LDocumentPublishDate = LDocumentData.datePublish;

                var LIndex = -1;
                for (var LLoopIndex2 = 0; LLoopIndex2 < LMergedArray.length; LLoopIndex2++) {
                    if (LDocumentName == LMergedArray[LLoopIndex2].documentName) {
                        LIndex = LLoopIndex2;
                        break;
                    }

                }

                if (LIndex > -1) {
                    //The document is already present in the data
                    var LDoc = LMergedArray[LIndex];
                    LDoc.keywords.push(LKeyword);
                }
                else {
                    //The document is already present in the data
                    var LDoc = {};
                    LDoc.keywords = [];
                    LDoc.keywords.push(LKeyword);
                    LDoc.documentName = LDocumentName;
                    LDoc.datePublish = LDocumentPublishDate;

                    //Merged array
                    LMergedArray.push(LDoc);
                }
            }
        }

        return LMergedArray;
    };

    //---------------------------------------------------------------
    LMe.highlightDocCircles = function (p_keyword) {
        //highlight the line chart
        LMe.svg.selectAll(".timeline-path-group").each(function (d) {
            if (d[0].keyword == p_keyword) {
                d3.select(this).select("path").style("stroke", "#6999c9");
            }
        });

        if (LMe.documentViewMode == "timeline_view") {
            //highlight the time line view
            LMe.ScatterPlotCircles.each(function (d) {
                var LIndex = libGetIndexOfWord(d.keywords, p_keyword);
                if (LIndex > -1) {
                    //keyword is present in the document
                    //Change the style to selected
                    d3.select(this).classed("document-circles-selected", true);

                    //Recalculate the radius
                    d3.select(this).transition().duration(500).attr("r", LMe.getRadiusOfScatterBubble(d, p_keyword));
                }
            });
        }
        else if (LMe.documentViewMode == "association_view") {
            LMe.associationViewNodes.each(function (d) {
                var LIndex = libGetIndexOfWord(d.keywords, p_keyword);
                if (LIndex > -1) {
                    //keyword is present in the document
                    //Change the style to selected
                    d3.select(this).classed("document-circles-selected", true);

                    //Recalculate the radius
                    d3.select(this).transition().duration(500).attr("r", LMe.getRadiusOfScatterBubble(d, p_keyword));
                }
            });
        }
    };

    //---------------------------------------------------------------
    LMe.unselectSelectedDocCircles = function (p_keyword) {
        LMe.svg.selectAll(".timeline-path-group").each(function (d) {
            if (d[0].keyword == p_keyword) {
                d3.select(this).select("path").style("stroke", "#ccc");
            }
        });

        if (LMe.documentViewMode == "timeline_view") {
            //unhighlight the time line view
            LMe.ScatterPlotCircles.each(function (d) {
                var LIndex = libGetIndexOfWord(d.keywords, p_keyword);
                if (LIndex > -1) {
                    //keyword is present in the document
                    //Change the style to selected
                    d3.select(this).classed("document-circles-selected", false);

                    //Recalculate the radius
                    d3.select(this).transition().duration(500).attr("r", LMe.getRadiusOfScatterBubble(d));
                }
            });
        }
        else if (LMe.documentViewMode == "association_view") {
            LMe.associationViewNodes.each(function (d) {
                var LIndex = libGetIndexOfWord(d.keywords, p_keyword);
                if (LIndex > -1) {
                    //keyword is present in the document
                    //Change the style to selected
                    d3.select(this).classed("document-circles-selected", false);

                    //Recalculate the radius
                    d3.select(this).transition().duration(500).attr("r", function (d) {
                        /*if(LMe.focussedCircle.Filename == d.Filename){
                        return 20;
                        }*/
                        return LMe.getRadiusOfScatterBubble(d);
                    });
                }
            });
        }

    };

    //---------------------------------------------------------------
    LMe.displayBubblesInTheRange = function (p_FromDate, p_ToDate) {
        LMe.ScatterPlotCircles.each(function (d) {
            var LCircle = this,
                LDate = LMe.dateFormat.parse(d.DatePublish);

            d3.select(LCircle).attr({
                cx: function (d) {
                    var Lx = LMe.x1(LMe.dateFormat.parse(d.DatePublish));
                    if (Lx < 0 || Lx > (LMe.width - LMe.margin.left - LMe.margin.right)) {
                        // the bubble is out of range
                        d3.select(this).style("display", "none");
                    }
                    else {
                        //the bubble is in range
                        d3.select(this).style("display", "block");
                    }
                    return Lx;
                }
            });

        });
    };

    //---------------------------------------------------------------
    LMe.onChangeAssociationsVisibleRange = function (p_AssociationVisibilityThreashold) {
        if (LMe.documentViewMode == "timeline_view") {
            LMe.generateTimeLineViewForCentralCircle();
        }
        else if (LMe.documentViewMode == "association_view") {
            LMe.generateAssociationViewForCentralCircle();
        }
        /*if(LMe.associationLines)
        {
        //If there are lines drawn update the lines
        LMe.associationLines.each(function(d){
        var LLine = d3.select(this);
        if(d.value < p_AssociationVisibilityThreashold)
        {
        LLine.style("display", "none");
        }
        else
        {
        LLine.style("display", "block");
        }
        });
        }*/
    };

    //---------------------------------------------------------------
    LMe.drawAssociation = function () {
        //Draw assiciation between the documents
    };

    //---------------------------------------------------------------
    LMe.switchViewToAssociationView = function () {
        LMe.documentViewMode = "association_view";
        LMe.drawAssociationLines();
        LMe.removeAssociationLines();
        LMe.updateDocumentAssociationViewLayout();
    };

    //---------------------------------------------------------------
    LMe.switchViewToTimelineView = function () {
        LMe.documentViewMode = "timeline_view";
        LMe.removeAssociationViewData();
        LMe.hideAssociationLines();
        LMe.hideAssociationScaleCircles();

        //Make all the scatter docs visible
        /*LMe.ScatterPlotCircles.each(function(d){
        var LCircle = d3.select(this);
        LCircle.style("display", "block");
        });*/

        LMe.addScatterChartCircle(LMe.currentDataChart);
    };

    //---------------------------------------------------------------
    LMe.updateDocumentAssociationViewLayout = function () {
        LMe.generateAssociationViewForCentralCircle();
        /*var LAssociationViewData = [],
        LLinks = [],
        LIndex = 0,
        LSourceIndex = 0,
        LfoccusedDocData = d3.select(LMe.focussedCircle).data()[0];

        //Get data for bubbles
        LMe.ScatterPlotCircles.each(function(d){
        var LCircle = d3.select(this);
        LCircle.style("display", "none");
        var Lx = LCircle.attr("cx");
        if(Lx < 0 || Lx > (LMe.width - LMe.margin.left - LMe.margin.right))
        {
        return;
        }

        if(LfoccusedDocData.Filename == d.Filename)
        {
        LSourceIndex = LIndex;
        }

        LAssociationViewData.push(d);
        LIndex ++;
        });

        //Get data for links
        for(var LLoopIndex = 0; LLoopIndex < LAssociationViewData.length; LLoopIndex++)
        {
        var LDocCol,
        LBubble = LAssociationViewData[LLoopIndex];
        //Get column for the document
        for(var LLoopIndex1 = 0; LLoopIndex1 < G_DATA_JSON.DOC_ASSOC_MATRIX.length; LLoopIndex1++)
        {
        var LColumn = G_DATA_JSON.DOC_ASSOC_MATRIX[LLoopIndex1];
        if(LColumn[""] == LfoccusedDocData.Filename)
        {
        LDocCol = LColumn;
        break;
        }
        }

        var LValue = LDocCol[LBubble.Filename];
        LBubble.associationVal = LValue;
        var LObj = {"source":LSourceIndex,"target":LLoopIndex,"value":LValue};
        LLinks.push(LObj);
        }

        if(! LMe.force)
        {
        var LForceHt = (LMe.timelineHeight + (LMe.height - LMe.timelineHeight)/2) * 2,
        LForceWd = LMe.width,
        LLinkDst = LMe.height - LMe.margin.top - LMe.margin.bottom - LMe.timelineHeight;
        LLinkDst = LLinkDst/2;

        LMe.force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .linkDistance(function(d) { return LLinkDst * d.value; })
        .charge(-100)
        .size([LForceWd, LForceHt]);

        LMe.force.on("tick", function(e) {
        LMe.node
        .attr("cx", function(d) {
        return d.x;
        })
        .attr("cy", function(d) {
        return d.y;
        });

        LMe.link.attr("x1", function(d) {
        return d.source.x;
        })
        .attr("y1", function(d) {
        return d.source.y;
        })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        });
        }

        LMe.force
        .nodes(LAssociationViewData)
        .links(LLinks)
        //.linkDistance(function(d) { return (LMe.height/2) * d.value; })
        .start();

        LMe.link = LMe.svg.selectAll(".link")
        .data(LLinks)
        .enter().append("line")
        .attr("class", "link document-assos-line");

        LMe.LCenterCircle = null;
        LMe.node = LMe.svg.selectAll(".node")
        .data(LAssociationViewData)
        .enter().append("circle")
        .attr("class", "node document-circles-assoc")
        .attr("r", function(d){
        if(d.Filename == LfoccusedDocData.Filename)
        {
        return 30;
        }
        return LMe.getRadiusOfScatterBubble(d);
        })
        .attr("fill", function(d){
        if(d.Filename == LfoccusedDocData.Filename)
        {
        return "#D4BE56";
        }
        return "#EEEEEE";
        })
        .on("mouseover", function(d){
        })
        .on("mouseout", function(d){
        })
        .on("click", function(d){
        })
        .call(LMe.force.drag);*/
    };

    //---------------------------------------------------------------
    LMe.removeAssociationLines = function () {
        LMe.scatterChartGroup.selectAll(".association-links").data([]).exit().remove();
    };

    //---------------------------------------------------------------
    LMe.removeAssociationViewData = function () {
        //LMe.force.stop();

        LMe.svg.selectAll(".link")
            .data([]).exit().remove();

        LMe.svg.selectAll(".node")
            .data([]).exit().remove();
    };

    //---------------------------------------------------------------
    LMe.createSlider = function () {

        var LMainContainer = LMe.scatterChartGroup.append("g").attr("class", "doc-assoc-slider-cntnr").style("display", "none"),
            LLblContainer = LMainContainer.append("g"),
            LLbl = LLblContainer.append("text").text("Document Similarity Threshold ('0' to show all relationships)").attr("class", "doc-assoc-slider-lbl"),
            LSliderContainer = LMainContainer.append("g"),
            LBtnContainer = LMainContainer.append("g");

        var margin = { top: 0, right: 20, bottom: 0, left: 20 },
        //            width = (LMe.width/2 - margin.left),
            width = (LMe.width - LMe.margin.left - LMe.margin.right) / 2,
            height = 30 - margin.bottom - margin.top,
            LRectHeight = 17,
            LRectWidth = 35,
            LRectRadius = 5,
        //LScaleX = (LMe.width - LMe.margin.left - LMe.margin.right)/2 - 155,
            LScaleX = -6,
            LScaleY = LMe.height - LMe.timelineHeight - height + 20,
            LBtnHeight = 17,
            LBtnWidth = 90,
            LBtnRadius = 10;

        console.log(LScaleX + " : " + LScaleY);
        var x = d3.scale.linear()
            .domain([0, 1])
            .range([0, (width + 1)])
            .clamp(true);

        LMe.assocSliderScale = x;

        var Lbrush = d3.svg.brush()
            .x(x)
            .extent([0, 0])
            .on("brush", L_brushed)
            .on("brushend", L_brushend);

        LMainContainer.attr("transform", "translate(" + LScaleX + "," + LScaleY + ")");
        LLblContainer.attr("transform", "translate(" + -17 + "," + 40 + ")");
        LSliderContainer.attr("transform", "translate(" + 6 + "," + 0 + ")");
        LBtnContainer.attr("transform", "translate(" + (width + 15) + "," + 6 + ")");

        LBtnContainer.append("rect")
            .attr("class", "svg-rect-btn")
            .attr("rx", LBtnRadius)
            .attr("ry", LBtnRadius)
            .attr("width", LBtnWidth)
            .attr("height", LBtnHeight)
            .on("click", function (d) {
                var LButtonText = LBtnTxt.text();
                if (LButtonText == "Association View") {
                    LBtnTxt.text("Timeline View");

                    LMe.switchViewToAssociationView();
                }
                else {
                    LBtnTxt.text("Association View");

                    LMe.switchViewToTimelineView();
                }
            });

        var LBtnTxt = LBtnContainer.append("text")
            .attr("x", 45)
            .attr("y", 11)
            .attr("class", "svg-rect-btn-txt")
            .text("Association View");

        LMe.btnSwitchGraphViewTxt = LBtnTxt;

        LSliderContainer.append("g")
            .attr("class", "x axis slider-axis")
            .attr("transform", "translate(0," + height / 2 + ")")
            .call(d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(0)
                .tickPadding(12));

        var slider = LSliderContainer.append("g")
            .attr("class", "slider")
            .call(Lbrush);

        slider.selectAll(".extent,.resize")
            .remove();

        slider.select(".background")
            .attr("height", height);

        var handle = slider.append("rect")
            .attr("class", "handle")
            .attr("rx", LRectRadius)
            .attr("ry", LRectRadius)
            .attr("transform", "translate(0," + height / 2 + ")")
            .attr("width", LRectWidth)
            .attr("height", LRectHeight);

        var sliderText = slider.append("text")
            .attr("class", "handle-text")
            .attr("transform", "translate(0," + height / 2 + ")");

        slider
            .call(Lbrush.event)
            .transition() // gratuitous intro!
            .duration(500)
            .call(Lbrush.extent([0, 0]))
            .call(Lbrush.event);

        var LPrevBrushExt = Lbrush.extent();
        function L_brushed() {

            var value = Lbrush.extent()[0];
            var value1 = Lbrush.extent()[1];

            //console.log("value -- " + value + ", value1 -- " + value1);
            if (LPrevBrushExt) {
                if (LPrevBrushExt[0] == value) {
                    //The brush has been moved to right
                    value = value1;
                }
                else if (LPrevBrushExt[1] == value1) {
                    //brush has moved to left
                    value = value;
                }
                else {
                    value = value;
                }
            }
            //value = value1;
            LPrevBrushExt = Lbrush.extent();

            var LDummyvalue = Math.round(value * 100);
            LDummyvalue = LDummyvalue / 100;

            /*console.log("val -- " + value);
            console.log("value1 -- " + value1);
            console.log("dummy val -- " + LDummyvalue);*/

            if (d3.event.sourceEvent) { // not a programmatic event
                value = x.invert(d3.mouse(this)[0]);
                Lbrush.extent([value, value]);
            }


            sliderText.attr("x", x(value));
            sliderText.attr("y", 3);
            var LXAxisValue = x(value);
            //LXAxisValue = (LMe.width - LMe.margin.left - LMe.margin.right)/2 + LXAxisValue;
            handle.attr("x", x(value) - LRectWidth / 2);
            sliderText.text(LDummyvalue);
            G_DOC_ASSOCIATION_THREASHOLD = 1 - LDummyvalue;

            if (LMe.focussedCircle) {
                LMe.onChangeAssociationsVisibleRange(LDummyvalue);
            }

            if (LMe.horizontantalSliderAdjustor) {
                LMe.horizontantalSliderAdjustor
                    .attr({
                        x1: LXAxisValue
                    });
            }

            if (LMe.vericalSliderAdjustor) {
                LMe.vericalSliderAdjustor
                    .attr({
                        x1: LXAxisValue,
                        x2: LXAxisValue
                    });
            }
        }

        function L_brushend() {
            var value = Lbrush.extent()[0];
            value = Math.round(value * 100);
            value = value / 100;

            if (d3.event.sourceEvent) { // not a programmatic event
                //value = x.invert(d3.mouse(this)[0]);
                Lbrush.extent([value, value]);
            }
            sliderText.text(value);
            sliderText.attr("x", x(value));
            sliderText.attr("y", 3);
            handle.attr("x", x(value) - LRectWidth / 2);
            handle.attr("y", -LRectHeight / 2);

            G_DOC_ASSOCIATION_THREASHOLD = value;

            var LXAxisValue = x(value);
            LMe.LXAxisValue = LXAxisValue;
            //LXAxisValue = (LMe.width - LMe.margin.left - LMe.margin.right)/2 + LXAxisValue;

            if (LMe.horizontantalSliderAdjustor) {
                LMe.horizontantalSliderAdjustor
                    .attr({
                        x1: LXAxisValue
                    });
            }

            if (LMe.vericalSliderAdjustor) {
                LMe.vericalSliderAdjustor
                    .attr({
                        x1: LXAxisValue,
                        x2: LXAxisValue
                    });
            }

            if (LMe.focussedCircle) {
                LMe.onChangeAssociationsVisibleRange(value);
            }
            /*if(LMe.focussedCircle)
            {
            //LMe.onChangeAssociationsVisibleRange(value);
            if(LMe.documentViewMode == "timeline_view")
            {
            //The visualization is in timeline view
            //Remove all the associations
            //LMe.removeAssociationLines();
            LMe.addScatterChartCircle(LMe.currentDataChart);
            }
            else if(LMe.documentViewMode == "association_view")
            {
            //LMe.switchViewToTimelineView();
            //LMe.removeAssociationLines();
            }
            }*/
        }
    };

    //---------------------------------------------------------------
    //    LMe.drawLegends = function () {
    //        var LDocumentTypeLegendsCntnr = LMe.svg.append("g"),
    //            LDocumentSizeLegendsCntnr = LMe.svg.append("g");

    //        var LDocTypeLegendHt = 20,
    //            LDocTypeLegendWd = 60;

    //        LDocumentTypeLegendsCntnr.attr("transform", "translate(" + (LMe.width - 120) + "," + (LMe.timelineHeight + 50) + ")");

    //        LDocumentTypeLegendsCntnr.append("rect")
    //            .attr("height", 160)
    //            .attr("width", 123)
    //            .attr("fill", "#6B6B6B");

    //        LDocumentTypeLegendsCntnr.append("text")
    //            .attr("x", 10)
    //            .attr("y", 22)
    //            .attr("class", "legend-doc-type-title")
    //            .text("Document")
    //            .append("tspan")
    //            .attr("x", 10)
    //            .attr("y", 37)
    //            .text("Type Filter");

    //        //Create legends for document type
    //        var LLegends = LDocumentTypeLegendsCntnr.selectAll(".doc-type-legend-group").data(G_DOCUMENT_TYPE);
    //        var LG = LLegends.enter().append("g")
    //            .attr("class", "doc-type-legend-group")
    //            .attr("transform", function (d, i) {
    //                d.isSelected = true;
    //                return "translate(0," + (45 + i * LDocTypeLegendHt) + ")";
    //            })
    //            .on("click", function (d) {
    //                var LLegendGroup = d3.select(this);
    //                if (d.isSelected) {
    //                    //unselect the type
    //                    d.isSelected = false;
    //                    LLegendGroup.select("rect").classed("doc-type-legend-rect-unselected", true);
    //                }
    //                else {
    //                    //select the type
    //                    d.isSelected = true;
    //                    LLegendGroup.select("rect").classed("doc-type-legend-rect-unselected", false);
    //                }

    //                if (LMe.documentViewMode == "timeline_view") {
    //                    LMe.generateTimeLineViewForCentralCircle();
    //                }
    //                else if (LMe.documentViewMode == "association_view") {
    //                    LMe.generateAssociationViewForCentralCircle();
    //                }
    //            });

    //        LG.append("rect")
    //            .attr("width", 15)
    //            .attr("height", 15)
    //            .attr("rx", 5)
    //            .attr("ry", 5)
    //            .attr("x", 10)
    //            .attr("y", 5)
    //            .attr("class", "doc-type-legend-rect");

    //        LG.append("text")
    //            .text(function (d) {
    //                return d.typeName
    //            })
    //            .attr("x", 30)
    //            .attr("y", 15)
    //            .attr("class", "doc-type-legend-txt");


    //        //add the circle size legend box
    //        LDocumentSizeLegendsCntnr.attr("transform", "translate(" + (LMe.width - 120) + "," + (LMe.timelineHeight + 220) + ")");

    //        LDocumentSizeLegendsCntnr.append("rect")
    //            .attr("height", 160)
    //            .attr("width", 119)
    //            .attr("fill", "none")
    //            .attr("stroke", "#6B6B6B");

    //        LDocumentSizeLegendsCntnr.append("text")
    //            .attr("x", 10)
    //            .attr("y", 22)
    //            .attr("class", "legend-doc-type-title")
    //            .text("Legend");

    //        var LDocSizeLegends = LDocumentSizeLegendsCntnr.selectAll(".doc-size-legend-group").data(G_DOCUMENT_CIRCLE_LEGENDS);
    //        var LTop = 30;
    //        var LSizeG = LDocSizeLegends.enter().append("g")
    //            .attr("class", "doc-size-legend-group")
    //            .attr("transform", function (d, i) {
    //                var LPrevTop = LTop;
    //                LTop = LTop + d.documentBubbleRadius + 20;
    //                return "translate(0," + (LPrevTop) + ")";
    //            });

    //        LSizeG.append("circle")
    //        //            .attr("cx", function(d){ return d.documentBubbleRadius + 5; })
    //            .attr("cx", function (d) { return 30; })
    //            .attr("cy", function (d) { return d.documentBubbleRadius + 5; })
    //            .attr("r", function (d) { return d.documentBubbleRadius; })
    //            .attr("class", "doc-size-legend-circle");

    //        LSizeG.append("text")
    //            .text(function (d) {
    //                if (!d.max) {
    //                    return d.min + "+";
    //                }
    //                return d.min + " - " + d.max;
    //            })
    //            .attr("x", 55)
    //            .attr("y", function (d) { return d.documentBubbleRadius + 7; })
    //            .attr("class", "doc-size-legend-txt");
    //    };

    //---------------------------------------------------------------
    LMe.displayDocumentDetails = function (p_DocumentDetails) {


        //Display document title
        d3.select("#doc-title").text(p_DocumentDetails.DocTitle);

        //Display document info
        var LInfo = p_DocumentDetails.DatePublish + " | " + p_DocumentDetails.DocumentType[0];
        d3.select("#doc-info").text(LInfo);
        d3.select("#doc-url").html(
				'<a href= ' + p_DocumentDetails.DocumentURL + ' target="_blank">' +
				p_DocumentDetails.DocumentURL +
				"</a>");
    }

    //---------------------------------------------------------------
    LMe.clearLoadedDocument = function () {
        d3.select("#doc-title").text("");
        d3.select("#doc-info").text("");
        d3.select("#top-keywords").text("");
        d3.select("#doc-content").text("");
        d3.select("#doc-url").html("");
    };

    //---------------------------------------------------------------
    LMe.showSlider = function () {

        d3.select(".doc-assoc-slider-cntnr").style("display", "block");
        if (!LMe.btnSwitchGraphViewTxt) return;
        if (LMe.documentViewMode == "timeline_view") {
            LMe.btnSwitchGraphViewTxt.text("Association View");
        }
        else if (LMe.documentViewMode == "association_view") {
            LMe.btnSwitchGraphViewTxt.text("Timeline View");
        }
    };

    //---------------------------------------------------------------
    LMe.hideSlider = function () {
        d3.select(".doc-assoc-slider-cntnr").style("display", "none");

        if (!LMe.btnSwitchGraphViewTxt) return;

        if (LMe.documentViewMode == "timeline_view") {
            LMe.btnSwitchGraphViewTxt.text("Association View");
        }
        else if (LMe.documentViewMode == "association_view") {
            LMe.btnSwitchGraphViewTxt.text("Timeline View");
        }
    };

    //---------------------------------------------------------------
    LMe.adjustScatterChartAxis = function () {
        //Change the border
        var LRect = d3.select(".brush rect.extent"),
            LRectWidth = parseFloat(LRect.attr("width")),
            LRectHeight = parseFloat(LRect.attr("height")),
            LRectX = parseFloat(LRect.attr("x")),
            LRectY = parseFloat(LRect.attr("y")),
            LStrokeDashArray;

        LStrokeDashArray = (LRectWidth + LRectHeight);
        LStrokeDashArray = LStrokeDashArray + "," + LRectWidth;
        LRect.attr("stroke-dasharray", LStrokeDashArray);

        if (LRectWidth < 1) {
            //The width is zero so we dont need to worry about the display line
            LMe.scatterChartAxisLeft.style("display", "none");
            LMe.scatterChartAxisRight.style("display", "none");
            LMe.scatterChartTickLeft.style("display", "none");
            LMe.scatterChartTickRight.style("display", "none");
            LMe.scaleValueTextLeft.style("display", "none");
            LMe.scaleValueTextRight.style("display", "none");
        }
        else {
            if (!LMe.scatterChartAxisLeft) {
                LMe.scatterChartAxisLeft = LMe.scatterChartGroup.append("line")
                    .attr("class", "scatter-chart-lines");
            }

            LMe.scatterChartAxisLeft
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", LRectX)
                .attr("y2", 0);

            if (!LMe.scatterChartAxisRight) {
                LMe.scatterChartAxisRight = LMe.scatterChartGroup.append("line")
                    .attr("class", "scatter-chart-lines");
            }

            var LLeft1 = LRectX + LRectWidth,
                LLeft2 = LMe.width - LMe.margin.left - LMe.margin.right - 10;
            LMe.scatterChartAxisRight
                .attr("x1", LLeft1)
                .attr("y1", 0)
                .attr("x2", LLeft2)
                .attr("y2", 0);

            if (!LMe.scatterChartTickLeft) {
                LMe.scatterChartTickLeft = LMe.scatterChartGroup.append("line")
                    .attr("class", "scatter-chart-lines")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", 20);
            }

            if (!LMe.scatterChartTickRight) {
                LMe.scatterChartTickRight = LMe.scatterChartGroup.append("line")
                    .attr("class", "scatter-chart-lines")
                    .attr("x1", LLeft2)
                    .attr("y1", 0)
                    .attr("x2", LLeft2)
                    .attr("y2", 20);
            }

            var LBrushExtend = LMe.brush.extent(),
                LLowerDate = LBrushExtend[0],
                LUpperDate = LBrushExtend[1];
            if (!LMe.scaleValueTextLeft) {
                LMe.scaleValueTextLeft = LMe.scatterChartGroup.append("text")
                    .attr("class", "scale-value-text")
                    .attr("x", 3)
                    .attr("y", 20);
            }
            LMe.scaleValueTextLeft.text(LMe.scaleDateDisplayFormat(LLowerDate));

            if (!LMe.scaleValueTextRight) {
                LMe.scaleValueTextRight = LMe.scatterChartGroup.append("text")
                    .attr("class", "scale-value-text")
                    .attr("x", (LLeft2 - 3))
                    .attr("y", 20)
                    .attr("text-anchor", "end");
            }
            LMe.scaleValueTextRight.text(LMe.scaleDateDisplayFormat(LUpperDate));

            LMe.scatterChartAxisLeft.style("display", "block");
            LMe.scatterChartAxisRight.style("display", "block");
            LMe.scatterChartTickLeft.style("display", "block");
            LMe.scatterChartTickRight.style("display", "block");
            LMe.scaleValueTextLeft.style("display", "block");
            LMe.scaleValueTextRight.style("display", "block");
        }
    };



    //---------------------------------------------------------------
    LMe.drawAssociationLines = function () {

        //alert('asdf');
        var LForceHt = ((LMe.height - LMe.timelineHeight) / 2) * 2,
            LForceWd = LMe.width - LMe.margin.left - LMe.margin.right,
            LCenterX = LForceWd / 2,
            LCenterY = LForceHt / 2,
            LLinkDst = LForceWd;
        LLinkDst = LLinkDst / 2;

        console.log(LCenterY);

        var LX = LMe.assocSliderScale(G_DOC_ASSOCIATION_THREASHOLD);

        if (!LMe.leftAssocScaleLine) {
            LMe.leftAssocScaleLine = LMe.scatterChartGroup.append("line")
                .attr({
                    class: "scatter-chart-lines association",
                    x1: LCenterX,
                    y1: LCenterY,
                    x2: LCenterX,
                    y2: LCenterY + 200
                });
        }
        if (!LMe.rightAssocScaleLine) {
            LMe.rightAssocScaleLine = LMe.scatterChartGroup.append("line")
                .attr({
                    class: "scatter-chart-lines association",
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: LCenterY + 180
                });
        }

        if (!LMe.horizontantalSliderAdjustor) {
            LMe.horizontantalSliderAdjustor = LMe.scatterChartGroup.append("line")
                .attr({
                    class: "scatter-chart-lines association",
                    x1: LX,
                    y1: LCenterY + 180,
                    x2: 0,
                    y2: LCenterY + 180
                });
        }
        else {
            LMe.horizontantalSliderAdjustor
                .attr({
                    class: "scatter-chart-lines association",
                    x1: LX,
                    y1: LCenterY + 180,
                    x2: 0,
                    y2: LCenterY + 180
                });
        }



        if (!LMe.vericalSliderAdjustor) {
            LMe.vericalSliderAdjustor = LMe.scatterChartGroup.append("line")
                .attr({
                    class: "scatter-chart-lines association",
                    x1: LX,
                    y1: LCenterY + 180,
                    x2: LX,
                    y2: LCenterY + 195
                });
        }
        else {
            LMe.vericalSliderAdjustor
                .attr({
                    class: "scatter-chart-lines association",
                    x1: LX,
                    y1: LCenterY + 180,
                    x2: LX,
                    y2: LCenterY + 195
                });
        }



        LMe.leftAssocScaleLine.attr("display", "block");
        LMe.rightAssocScaleLine.attr("display", "block");
        LMe.horizontantalSliderAdjustor.attr("display", "block");
        LMe.vericalSliderAdjustor.attr("display", "block");
        //alert('2')
    };

    //---------------------------------------------------------------
    LMe.hideAssociationLines = function () {
        LMe.leftAssocScaleLine.attr("display", "none");
        LMe.rightAssocScaleLine.attr("display", "none");
        LMe.horizontantalSliderAdjustor.attr("display", "none");
        LMe.vericalSliderAdjustor.attr("display", "none");
    };

    //---------------------------------------------------------------
    LMe.displayAssociationScalesCircles = function () {

        var LForceHt = ((LMe.height - LMe.timelineHeight) / 2) * 2,
            LForceWd = LMe.width - LMe.margin.left - LMe.margin.right,
            LCenterX = LForceWd / 2,
            LCenterY = LForceHt / 2;

        if (!LMe.assocViewScaleCircle1) {
            LMe.assocViewScaleCircle1 = LMe.scatterChartGroup.append("circle")
                .attr("r", 95.25)
                .attr("cx", LCenterX)
                .attr("cy", LCenterY)
                .attr("fill", "transparent")
                .attr("opacity", 1)
                .style("pointer-events", "none")
                .attr("stroke", "#bbb");
        }

        if (!LMe.assocViewScaleCircle2) {
            LMe.assocViewScaleCircle2 = LMe.scatterChartGroup.append("circle")
                .attr("r", 190.5)
                .attr("cx", LCenterX)
                .attr("cy", LCenterY)
                .attr("fill", "transparent")
                .attr("opacity", 1)
                .style("pointer-events", "none")
                .attr("stroke", "#ccc");
        }

        if (!LMe.assocViewScaleCircle31) {
            /*LMe.assocViewScaleCircle3 = LMe.scatterChartGroup.append("circle")
            .attr("r", 285.75)
            .attr("cx", LCenterX)
            .attr("cy", LCenterY)
            .attr("fill", "transparent")
            .attr("opacity", 1)
            .style("pointer-events" , "none")
            .attr("stroke", "#9A9A9B");*/

            var arc1 = d3.svg.arc()
                .innerRadius(285.75)
                .outerRadius(286.75)
                .startAngle(46.2 * (3.14 / 180)) //converting from degs to radians
                .endAngle((180 - 46.2) * (3.14 / 180)); //just radians

            LMe.assocViewScaleCircle31 = LMe.scatterChartGroup.append("path")
                .attr("d", arc1)
                .attr("fill", "#ddd")
                .attr("opacity", 1)
                .style("pointer-events", "none")
                .attr("transform", "translate(" + LCenterX + "," + LCenterY + ")")

            var arc2 = d3.svg.arc()
                .innerRadius(285.75)
                .outerRadius(286.75)
                .startAngle((46.2 + 180) * (3.14 / 180)) //converting from degs to radians
                .endAngle((360 - 46.2) * (3.14 / 180)); //just radians

            LMe.assocViewScaleCircle32 = LMe.scatterChartGroup.append("path")
                .attr("d", arc2)
                .attr("fill", "#ddd")
                .attr("opacity", 1)
                .style("pointer-events", "none")
                .attr("transform", "translate(" + LCenterX + "," + LCenterY + ")")
        }

        if (!LMe.assocViewScaleCircle41) {
            /*LMe.assocViewScaleCircle4 = LMe.scatterChartGroup.append("circle")
            .attr("r", 383)
            .attr("cx", LCenterX)
            .attr("cy", LCenterY)
            .attr("fill", "transparent")
            .attr("opacity", 1)
            .attr("stroke-dasharray", "200, 200")
            //.style("pointer-events" , "none")
            .attr("stroke", "#9A9A9B");*/

            var arc1 = d3.svg.arc()
                .innerRadius(383)
                .outerRadius(384)
                .startAngle(59 * (3.14 / 180)) //converting from degs to radians
                .endAngle((180 - 59) * (3.14 / 180)); //just radians

            LMe.assocViewScaleCircle41 = LMe.scatterChartGroup.append("path")
                .attr("d", arc1)
                .attr("fill", "#eee")
                .attr("opacity", 1)
                .style("pointer-events", "none")
                .attr("transform", "translate(" + (LCenterX) + "," + (LCenterY) + ")");

            var arc2 = d3.svg.arc()
                .innerRadius(383)
                .outerRadius(384)
                .startAngle((59 + 180) * (3.14 / 180)) //converting from degs to radians
                .endAngle((360 - 59) * (3.14 / 180)); //just radians

            LMe.assocViewScaleCircle42 = LMe.scatterChartGroup.append("path")
                .attr("d", arc2)
                .attr("fill", "#eee")
                .attr("opacity", 1)
                .style("pointer-events", "none")
                .attr("transform", "translate(" + (LCenterX + 1) + "," + LCenterY + ")")
        }

        LMe.assocViewScaleCircle1.style("display", "block");
        LMe.assocViewScaleCircle2.style("display", "block");
        LMe.assocViewScaleCircle31.style("display", "block");
        LMe.assocViewScaleCircle32.style("display", "block");
        LMe.assocViewScaleCircle41.style("display", "block");
        LMe.assocViewScaleCircle42.style("display", "block");
    };

    //---------------------------------------------------------------
    LMe.hideAssociationScaleCircles = function () {
        LMe.assocViewScaleCircle1.style("display", "none");
        LMe.assocViewScaleCircle2.style("display", "none");
        LMe.assocViewScaleCircle31.style("display", "none");
        LMe.assocViewScaleCircle32.style("display", "none");
        LMe.assocViewScaleCircle41.style("display", "none");
        LMe.assocViewScaleCircle42.style("display", "none");
    };


    //---------------------------------------------------------------
    LMe.displayOuterCircleForFocussedCircle = function (p_FocussedCircle, p_displayInCenter) {
        var LFocussedCircle = d3.select(p_FocussedCircle);
        var LCX = LFocussedCircle.attr("cx"),
            LCY = LFocussedCircle.attr("cy");

        if (p_displayInCenter) {
            var LForceHt = ((LMe.height - LMe.timelineHeight) / 2) * 2,
                LForceWd = LMe.width - LMe.margin.left - LMe.margin.right,
                LCenterX = LForceWd / 2,
                LCenterY = LForceHt / 2;
            LCX = LCenterX;
            LCY = LCenterY;
        }



        if (!LMe.outerCircleOfFocussedCircle) {
            LMe.outerCircleOfFocussedCircle = LMe.scatterChartGroup.append("circle");
        }

        LMe.outerCircleOfFocussedCircle
            .attr("fill", "none")
        //            .attr("fill", "transparent")
            .attr("stroke", "#6999c9")
            .style("display", "block")
            .attr("stroke", "#FFF")
            .attr("stroke-width", "2px")
            .attr("cx", LCX)
            .attr("cy", LCY)
            .attr("r", function (d) { return parseFloat(LFocussedCircle.attr("r")) + 5; });
    };

    //---------------------------------------------------------------
    LMe.hideOuterCircleForFocussedCircle = function () {
        if (LMe.outerCircleOfFocussedCircle) {
            LMe.outerCircleOfFocussedCircle
                .style("display", "none");
        }
    };

    //---------------------------------------------------------------
    LMe.displaySlideInHint = function (p_Text) {
        var LAppHint = d3.select(".app-hint");

        LAppHint.text(p_Text);
        var LScreenWd = $(window).width(),
            LHintWd = $(".app-hint").width(),
            LHintLeft = LScreenWd / 2 - LHintWd / 2;

        LAppHint
            .style("display", "block")
            .style("top", "-50px")
            .style("left", LHintLeft + "px");
        LAppHint.transition().duration(1000).style("top", "50px");

        if (LMe.hintTimer) {
            //The timer was already started and hasn't finished yet
            window.clearTimeout(LMe.hintTimer);
            LMe.hintTimer = null;
        }

        LMe.hintTimer = setTimeout(function () {
            LAppHint.transition().duration(1000).style("display", "none");
        }, 2500)
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}


