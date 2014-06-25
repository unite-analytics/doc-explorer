function clsDocumentAssociationChart(p_Config){
    var LMe = this;


    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        LMe.svg = d3.select("#" + LMe.svgId)
            .attr("height", LMe.height + "px")
            .attr("width", LMe.width + "px");

        LMe.force = d3.layout.force()
            .gravity(.05)
            .distance(100)
            .charge(-100)
            .size([LMe.width, LMe.height]);

        LMe.force.on("tick", function(e) {

            if(e.alpha < 0.04)
            {
                LMe.force.stop();
            }

            LMe.node
                .attr("cx", function(d) {
                    if(d.fixed){
                        d.x = LMe.width/2;
                    }
                    return d.x;
                })
                .attr("cy", function(d) {
                    if(d.fixed){
                        d.y = LMe.height/2;
                    }
                    return d.y;
                });

            LMe.link.attr("x1", function(d) {
                    /*if(d.source.fixed){
                        return LMe.width/2;
                    }*/
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    /*if(d.source.fixed){
                        return LMe.width/2;
                    }*/
                    return d.source.y;
                })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });



            /*d3.select(LMe.LCenterCircle)
                .attr("cx", LMe.width/2)
                .attr("cy", LMe.height/2);*/
        });

        LMe.tooltip = d3.select("#tooltip")
            .html("")
            .style("position", "absolute")
            .style("z-index", "99999")
            .style("visibility", "hidden")
            .text("")
            .on("mouseenter", function(){
                if(LMe.timoutObj)
                {
                    window.clearTimeout(LMe.timoutObj);
                }

                LMe.tooltip.style("visibility", "display");


            })
            .on("mouseleave", function(){
                LMe.tooltip.style("visibility", "hidden");
            });

        LMe.tooltip.append('div')
            .attr("class", "tooltip-html");

        /*LMe.tooltip.append('div')
         .attr("class", "tail");*/
    };

    //---------------------------------------------------------------
    LMe.drawDocumentAssociationChart = function(p_dateRange, p_CenterDoc){
        //Clear the contents of SVG
        LMe.svg.html("");
        //Clear contents of last loaded document
        d3.select("#clicked-document-title").text("");
        d3.select("#clicked-document-cntnt")
            .text("")
            .style("border-top", "0px solid #EEEEEE");

        //Create the dotted lined circle
        LMe.svg
            .append("circle")
            .attr("class", "scale-circles")
            .attr("cx", LMe.width/2)
            .attr("cy", LMe.height/2)
            .attr("r", LMe.width/4);

        LMe.svg
            .append("circle")
            .attr("class", "scale-circles")
            .attr("cx", LMe.width/2)
            .attr("cy", LMe.height/2)
            .attr("r", LMe.width/3);

        LMe.svg
            .append("circle")
            .attr("class", "scale-circles")
            .attr("cx", LMe.width/2)
            .attr("cy", LMe.height/2)
            .attr("r", LMe.width/2);

        //Get the document association object
        var LDocAssosObj;
        for(var LLoopIndex=0; LLoopIndex < LMe.data.length; LLoopIndex++)
        {
            var LObj = LMe.data[LLoopIndex];
            if(p_CenterDoc.documentName == LObj[""])
            {
                //Center Document found
                LDocAssosObj = LObj;
                break;
            }
        }

        //Traverse all the document and prepare data for chart
        var LChartData = [],
            LLinksData = [],
            LCenterDocumentIndex;



        for(var LKey in LDocAssosObj)
        {
            if(LKey == "")
            {
                continue;
            }

            var LDocumentDate,
                LGDocData = G_DATA_JSON.DOC_DATA;
            for(var LLoopIndex1 = 0; LLoopIndex1 < LGDocData.length; LLoopIndex1++)
            {
                var LDocData = LGDocData[LLoopIndex1],
                    LDocName = LDocData.DocLabel.replace(/\//g, '_');
                LDocName = '[' + (LLoopIndex1 + 1) + ']_' + LDocName + '.txt';
                if(LDocName == LKey)
                {
                    LDocumentDate =  LDocData.DatePublish;
                    break;
                }
            }

            var LDocData = {
                name : LKey,
                value : LDocAssosObj[LKey],
                publishDate : LDocumentDate
                };

            LChartData.push(LDocData);
        }

        var LIndex = 0;
        for(var LLoopIndex2 = 0; LLoopIndex2 < LChartData.length; LLoopIndex2++)
        {
            var LObj = LChartData[LLoopIndex2];
            if(LObj.name == p_CenterDoc.documentName)
            {
                LCenterDocumentIndex = LIndex;
                break;
            }
            LIndex++;
        }

        for(var LLoopIndex2 = 0; LLoopIndex2 < LChartData.length; LLoopIndex2++)
        {
            var LObj = LChartData[LLoopIndex2];
            if(LCenterDocumentIndex == LLoopIndex2)
            {
                //skip the central document
                continue;
            }
            var LLinkData = {"source":LCenterDocumentIndex,"target":LLoopIndex2,"value":LObj.value};
            LLinksData.push(LLinkData);
        }

        //Draw the chart
        LMe.drawChart(p_dateRange, p_CenterDoc, LChartData, LLinksData);
    };

    //---------------------------------------------------------------
    LMe.drawChart = function(p_dateRange, p_CenterDoc, p_ChartData, p_LinksData){
        LMe.force
            .nodes(p_ChartData)
            .links(p_LinksData)
            .linkDistance(function(d) { return (LMe.height/2) * d.value; })
            .start();

        LMe.link = LMe.svg.selectAll(".link")
            .data(p_LinksData)
            .enter().append("line")
            .attr("class", "link document-assos-line");

        LMe.LCenterCircle = null;
        LMe.node = LMe.svg.selectAll(".node")
            .data(p_ChartData)
            .enter().append("circle")
            .attr("class", "node document-circles")
            .attr("r", function(d){
                if(d.name == p_CenterDoc.documentName)
                {
                    LMe.LCenterCircle = this;
                    /*d3.select(this)
                        .attr("cx", LMe.width/2)
                        .attr("cy", LMe.height/2);*/
                    d.fixed = true;
                    return 30;
                }
                return 10;
            })
            .on("mouseover", function(d){
                var LRadius = 15,
                    LCircle = d3.select(this);
                d._r = LCircle.attr("r");
                if(d.fixed) LRadius = 35;

                d3.select(this).transition().duration(500)
                    .attr("r", LRadius)
                    .attr("stroke-width", "3");

                LMe.tooltip.style("visibility", "visible");
                d3.select("#tooltip .tooltip-html").html("Loading " + d.name + "...");

                var currHeight = $('#tooltip').height(),
                    LPageY = d3.event.pageY,
                    LPageX = d3.event.pageX;

                var LToolTipTop = LPageY - currHeight - 100,
                    LToolTipLeft = LPageX - 150;
                if(LToolTipTop < 0)
                {
                    //tooltip is going out of screen
                    LToolTipTop = LPageY + 100;
                }
                LMe.tooltip.style("top", +"px")
                    .style("left",LToolTipLeft +"px");

                var LDocURL = "data/txt/" + d.name;
                d3.text(LDocURL, function(p_Text){
                    var LDocTxt = p_Text.substring(0, 120);
                    LDocTxt += '...';

                    //clear the hint
                    var LToolTip = d3.select("#tooltip .tooltip-html").html("");

                    //add title
                    LToolTip.append("div")
                        .attr("class", "title")
                        .text(d.name)

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
                    if(LToolTipTop < 0)
                    {
                        //tooltip is going out of screen
                        LToolTipTop = LPageY + 30;
                    }

                    LMe.tooltip.style("top", LToolTipTop +"px")
                        .style("left",LToolTipLeft + "px");

                    /*LMe.timoutObj = setTimeout(function(){

                     }, 3000);*/

                });
            })
            .on("mouseout", function(d){
                d3.select(this).transition().duration(500)
                    .attr("r", d._r)
                    .attr("stroke-width", "1");

                LMe.tooltip.style("visibility", "hidden");
            })
            .on("click", function(d){
                //d3.select("#clicked-document-title").text("");
                //d3.select("#clicked-document-cntnt").text("");

                var LDocURL = "data/txt/" + d.name;
                d3.text(LDocURL, function(p_Text){
                    d3.select("#clicked-document-title").text(d.name);
                    d3.select("#clicked-document-cntnt")
                        .text(p_Text)
                        .style("border-top", "1px solid #EEEEEE");
                });
            })
            .call(LMe.force.drag);
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}


