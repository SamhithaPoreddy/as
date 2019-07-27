/*
2018-07-02
created by liuwei
2019-07-05
Recreated by Kaixuan
*/

jsPlumb.ready(function () {

    $(".advanced-config").hide()
    $("#hideConfig").hide()
    
    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 5}],
        Connector:"Flowchart",
        // Connector: ["Bezier", {curviness: 30}],
        HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 2 },
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 14,
                foldback: 0.8
            } ],
            [ "Label", { label: "default", id: "label", cssClass: "aLabel" }]
        ],
        Container: "canvas",
        enableWheelZoom: true,
        // wheelZoomMetaKey: true,
        Anchor : [ 0.5, 0.5, 1, 1 ]
        // Anchors : ["TopCenter", "BottomCenter"]
    });

    instance.registerConnectionType("basic", { anchor:"Continuous", connector:"Flowchart" });

    window.jsp = instance;

    var canvas = document.getElementById("canvas"),
    canvasElement = document.getElementsByClassName("w"),
    saveNodeBtn = document.getElementById("saveNode");
    var windows = jsPlumb.getSelector(".statemachine-demo .w");

    var data = $("#string").html();
    var unpack=JSON.parse(data);


    //click event on the connector line
    instance.bind("click", function (c) {
        // console.log(c,c.getData(),c.getId());
        var html = '';
        var conditionVal = c.getData();

        html+='<div class="form-group">';
        html+='<label for="name">Jump Condition '+conditionVal.data+'</label>';
        html+='<input type="text" class="form-control" key="'+conditionVal.data+'" placeholder="Please enter">';
        html+='</div>';
        
        $("#conditionForm").html(html);
        $("#editConnectModal").modal('show');
        $("#submitConnect").bind("click",function(){
            var input = $("#conditionForm input");
            c.setData({data:input.val()});
            console.log(c);
            c.getOverlay("label").setLabel('<div>' + input.val() + '</div>');
            unbinds();
        });

        $("#deleteConnect").bind("click",function(){
            instance.deleteConnection(c);
            // console.log("delete events");
            unbinds();
        });
        
        $("#addConnectModalClose").bind("click", function(){
            unbinds();
            $("#addConnectModal").modal("hide");
        });

        function unbinds(){
            $("#submitConnect").unbind("click");
            $("#deleteConnect").unbind("click");
            $("#addConnectModal").unbind("click");
        }
    });
    
    //Events for each connection creation
    var connections = 0
    var start = 0
    instance.bind("connection", function (info) {

        if(connections >= unpack[1].length){
            var htmlKey = '';
            htmlKey+='<div class="form-group">';
            htmlKey+='<label for="name">Name for the condition</label>';
            htmlKey+='<input type="text" class="form-control connectKey" value="" placeholder="Please enter">';
            htmlKey+='</div>';
            $("#addConditionForm").html(htmlKey);
            $("#addConnectModal").modal('show');
        }
        else{
            console.log("hello")
            info.connection.setData({data:eval(unpack[1][connections.length - 1]).data})
        }

        // Need to be fixed;
        $('#addConnectModal').on('hidden.bs.modal', function () {
            start++;
            console.log("starting");
            if (start - 1 == connections){
                info.connection.setData({data:$(".connectKey").val()});
                info.connection.getOverlay("label").setLabel('<div>' + $(".connectKey").val() + '</div>');
                start = 0;
                connections++;
            } 
        });
        
    });

    var pageOffsetX = 0,
        pageOffsetY = 0,
        logoOffsetX = 0,
        logoOffsetY = 0;
    $(".drag-drop").on('mousedown', function(e){
        logoOffsetX = e.pageX;
        logoOffsetY = e.pageY;
    })
    $(".drag-drop").on('mouseup', function(e){
        console.log(e.pageX + " , " + e.pageY);
        var canvasRect = document.getElementById("canvas").getBoundingClientRect();
        pageOffsetX = e.pageX - canvasRect.left;
        pageOffsetY = e.pageY - canvasRect.top;
    });

    //Create new node --edit done
    var counter = 1;

    function showAddNodeModal(x, y, canShow, serviceType, idCounter){
        // console.log(dragCounter, isMouseUp);
        if(canShow){
        // if((dragCounter == 1 || dragCounter > 1) && isMouseUp == true){
            $("#myModalLabel").html("Add Node");
            $("#deleteBlock").hide();
            $("#myModal").modal('show');
            $("#service").val(serviceType);
            $("#editBlock").bind("click",function(){
                var newData = {};
                newData ={service:$("#service").val(),describe:$("#describe").val(),host:$("#host").val(),port:$("#port").val(),key:$("#key").val()};
                newNode(idCounter,'',x+pageOffsetX, y+pageOffsetY,newData);
                counter++;
                $("#editBlock").unbind("click");
            });
    
            $("#myModalClose").bind("click", function(){
                $("#myModal").modal('hide');
                $("#editBlock").unbind("click");
                $("#myModalClose").unbind("click");
            });
        }
    }

    // export data
    jsPlumb.on(saveNodeBtn, "click", function(e) {
        dataToBeSent = exportData();
        $.ajax({
            url:  "/devtest/post",
            type: "POST",
            data: {
                nodes: dataToBeSent[0],
                vpc: dataToBeSent[1]
            },
            success: function(data){
                alert("posted");
            },
            error: function(err){
                alert(err);
            }
        });
    });

    // initialize elements as connection targets and sources.
    var initNode = function(el, drag, src, target, dlCallback, classname){
        // 1. make draggable
        if(drag){
            instance.draggable(el);
        }
        // 2. make source
        if(src){
            instance.makeSource(el, {
                filter: ".ep",
                anchor: "Continuous",
                connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
                connectionType:"basic",
                extract:{
                    "action":"the-action"
                },
                maxConnections: 10,
                onMaxConnections: function (info, e) {
                    alert("Maximum connections (" + info.maxConnections + ") reached");
                }
            });
        };

        // 3. make target
        if(target){
            instance.makeTarget(el, {
                dropOptions: { hoverClass: "dragHover" },
                anchor: "Continuous",
                allowLoopback: false
            });
        };
        //bind double click event with edit on node
        jsPlumb.on(classname, "dblclick", function (el){
            dlCallback(el);
        });
        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        instance.fire("jsPlumbDemoNodeAdded", el);
    }

    // Data exportation
    function exportData(){
        var blocksNode=[],blocksConnect = [];                          
        $(".w").each(function(idx, elem){
            var elem=$(elem);                           
            blocksNode.push({
                BlockId:elem.attr('id'),
                BlockX:parseInt(elem.css("left"), 10),
                BlockY:parseInt(elem.css("top"), 10),
                data:JSON.parse(elem.find("input").val())
            });
        });
        instance.getConnections().forEach(function(ele){
            blocksConnect.push({
                source: ele.sourceId, 
                target: ele.targetId,
                data:ele.getData().data,
                type:"basic"
            })
        });
        var blocks = [];
        blocks.push(blocksNode,blocksConnect);
        console.log(blocks);
        var serialize=JSON.stringify(blocks);
        console.log(serialize);

        // iterate through the nodes, and check if a node is inside a service
        console.log("separator");
        vpcResult = [];
        $(".vpc").each(function(_, elem){
            var elem = $(elem);
            var position = elem.position();
            var vpcRect = this.getBoundingClientRect();
            vpcContents = [];
            $(".w").each(function(_, w){
                var wRect = this.getBoundingClientRect();
                if (wRect.x + wRect.width < vpcRect.x + vpcRect.width 
                    && wRect.x > vpcRect.x
                    && wRect.y > vpcRect.y
                    && wRect.y + wRect.height < vpcRect.y + vpcRect.height
                    ){
                    // console.log("block " + $(w).attr("id") + " in vpc " + elem.attr("id"));
                    vpcContents.push($(w).attr("id"));
                }
            });
            vpcResult.push({
                vpcid: elem.attr("id"),
                vpcService: vpcContents
            });
        });
        // To the backend potentially
        $("#outputText").html(serialize + ";\n" + JSON.stringify(vpcResult));
        return [serialize, JSON.stringify(vpcResult)];
    }

    // Node creation
    function newNode(id,name,x, y,data) {
        var d = document.createElement("div");
        if(!id){
            var id = "a"+jsPlumbUtil.uuid();
            var name = "content"
        }
        // var id = "a"+jsPlumbUtil.uuid();
        d.className = "w " + data.service;
        d.id = id;
        console.log(id, data.describe, name);
        d.innerHTML = '<img class="service-logo" src="img/' + data.service + '.jpeg">'
                    + '<input type="hidden" value='+JSON.stringify(data)+'><div class=\"ep\"></div>';
        d.style.left = x + "px";
        d.style.top = y + "px";
        d.style.position = "absolute";
        // d.style.opacity = 0.5;
        instance.getContainer().appendChild(d);
        initNode(d, true, true, true, function(el){
            // var info = instance.getObjectInfo(this)
            var id = "";
            if($(el.target).prop("tagName") == "P" || $(el.target).prop("tagName") == "IMG"){
                // $(el.target).parent();
                id = $(el.target).parent()[0].id;
            }else{
                id = el.target.id;
            }

            var newTarget = $("#" + id);
            var blockString = $("#"+id).find("input").val();
            var blockObj = JSON.parse(blockString);

            $("#service").val(blockObj.service);
            $("#describe").val(blockObj.describe);
            $("#host").val(blockObj.host);
            $("#port").val(blockObj.port);
            $("#key").val(blockObj.key);

            $("#deleteBlock").show();
            $("#myModal").modal('show');

            $("#editBlock").bind("click",function(){
                var newData = {};
                newData ={service:$("#service").val(),describe:$("#describe").val(),host:$("#host").val(),port:$("#port").val(),key:$("#key").val()};
                $("#"+ id).find("input").val(JSON.stringify(newData));
                $("#"+id).find(".title").html(newData["service"]);
                $("#"+id).find(".describe").html(newData["describe"]);
                $("#"+id).find(".service-logo").attr("src","img/" + $("#service").val() + ".jpeg");
                unbindsSecond();
            });

            $("#deleteBlock").bind("click",function(){
                instance.getConnections().forEach(function(ele){
                    if(ele.sourceId==id||ele.targetId==id){
                        instance.deleteConnection(ele);
                        connections--;
                    }
                });
                newTarget.remove();
                unbindsSecond();
            });

            $("#myModalClose").bind("click", function(){
                unbindsSecond();
                $("#myModal").modal('hide');
            });

            function unbindsSecond(){
                $("#editBlock").unbind("click");
                $("#deleteBlock").unbind("click");
                $("#myModalClose").unbind("click");
            }
            console.log(instance.getAllConnections(),instance.getConnections(newTarget));
            
        }, ".w");
        return d;
    };

    window.setZoom = function (zoom, instance, transformOrigin, el) {
        transformOrigin = transformOrigin || [0.5, 0.5];
        instance = instance || jsPlumb;
        el = el || instance.getContainer();
        var p = ["webkit", "moz", "ms", "o"],
        s = "scale(" + zoom + ")",
        oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";
        for(var j=0;j<el.length;j++){
            for (var i = 0; i < p.length; i++) {
                el[j].style[p[i] + "Transform"] = s;
                el[j].style[p[i] + "TransformOrigin"] = oString;
            }
            el[j].style["transform"] = s;
            el[j].style["transformOrigin"] = oString;
        }
        instance.setZoom(zoom, true);
        instance.repaintEverything();
    };

    // function will be called if we have predefined data
    // eg. previously the user stored some processes in the server.
    ;(function (){
        if(!unpack){
            return false;
        }
        unpack[0].map(function(value, index, array) {
            var _block = eval(value);
            newNode(_block.BlockId,_block.BlockContent, _block.BlockX, _block.BlockY,_block.data);
        });
        unpack[1].map(function(value, index, array) {
            var _block = eval(value);
            instance.connect({ source: _block.source, target: _block.target, type:"basic"});
        });

        return true;
    })();
    jsPlumb.fire("jsPlumbDemoLoaded", instance);

    // target elements with the "draggable" class
    interact('.draggable')
    .draggable({
        modifiers: [
            interact.modifiers.restrict({
                restriction: "toolkit",
                endOnly: true, // to prevent elements from moving off restriction
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            }),
        ],
        // enable autoScroll
        autoScroll: true,
        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
            $(event.target).css("transform", "");
            event.target.setAttribute('data-x', 0);
            event.target.setAttribute('data-y', 0);
            
            showAddNodeModal(0, 0, event.target.classList.contains("can-drop"), $(".can-drop").data("service"), counter);
            event.target.classList.remove('can-drop');
        }
    });

    function dragMoveListener (event) {
        var target = event.target,
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    // this is used later in the resizing and gesture demos
    window.dragMoveListener = dragMoveListener;

    var vpcCounter = 0;
    $("#addVPC").on('click', function(){
        var d = document.createElement("div");
        d.className = "vpc vpc-dropzone";
        d.id = "vpc-" + vpcCounter;
        vpcCounter++;
        d.style.left = 0 + "px";
        d.style.top = 0 + "px";
        d.style.position = "absolute";
        d.textContent = "vpc";
        instance.getContainer().appendChild(d);
        initNode(d,false,false,false,function(){
            console.log("hello, you double click the vpc div");
            /* pop up modular */
        }, ".vpc");
    })
    
});

function addConfig(){
    $( "#addConfig" ).hide();
    $(".advanced-config").show();
    $( "#hideConfig" ).show();
}

function hideConfig(){
    $(".advanced-config").hide();
    $( "#addConfig" ).show();
    $( "#hideConfig" ).hide();
}