jsPlumb.ready(function () {

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
    interact('.dropzone').dropzone({
        // only accept elements matching this CSS selector
        accept: '.draggable',
        // Require a 75% element overlap for a drop to be possible
        overlap: 0.75,

        // listen for drop related events:
        ondropactivate: function (event) {
            // add active dropzone feedback
            event.target.classList.add('drop-active')
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget;
            var dropzoneElement = event.target;
            // feedback the possibility of a drop
            dropzoneElement.classList.add('drop-target')
            draggableElement.classList.add('can-drop')
            //   draggableElement.textContent = 'Dragged in'
            //   dragCounter++;
        },
        ondragleave: function (event) {
            // remove the drop feedback style
            event.target.classList.remove('drop-target');
            event.relatedTarget.classList.remove('can-drop');
            //   event.relatedTarget.textContent = 'Dragged out';
        },
        // ondrop: function (event) {
        //     event.relatedTarget.textContent = 'Dropped';
        // },
        ondropdeactivate: function (event) {
            // remove active dropzone feedback
            event.target.classList.remove('drop-active')
            event.target.classList.remove('drop-target')
        }
    });
    
    // interact('.drag-drop').draggable({
    // //   inertia: true,
    //     modifiers: [
    //     interact.modifiers.restrict({
    //             restriction: "parent",
    //             endOnly: true,
    //             elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    //         })
    //     ],
    //     autoScroll: true,
    //     onmove: window.dragMoveListener
    // });

    interact('.vpc')
    .draggable({
        onmove: window.dragMoveListener,
        modifiers: [
            interact.modifiers.restrict({
                restriction: 'parent',
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            })
        ]
    })
    .resizable({
        // resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },

        modifiers: [
            // keep the edges inside the parent
            interact.modifiers.restrictEdges({
                outer: 'parent',
                endOnly: true,
            }),

            // minimum size
            interact.modifiers.restrictSize({
                min: { width: 100, height: 50 },
            }),
        ],

        inertia: true
    })
    .on('resizemove', function (event) {
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0),
            y = (parseFloat(target.getAttribute('data-y')) || 0);

        // update the element's style
        target.style.width  = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
    });
});