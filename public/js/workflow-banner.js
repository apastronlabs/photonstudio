document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('workflow-container');
    const nodeImage = document.getElementById('node-image');
    const nodeVideo = document.getElementById('node-video');
    const svgPath = document.getElementById('workflow-path');

    if (!container || !nodeImage || !nodeVideo || !svgPath) return;

    let isDragging = false;
    let dragTarget = null;
    let startX, startY;
    let initialX, initialY;

    // We'll give the nodes some initial coordinates inside the container
    nodeImage.dataset.x = container.clientWidth * 0.38;
    nodeImage.dataset.y = container.clientHeight * 0.55 - (nodeImage.clientHeight / 2);
    
    nodeVideo.dataset.x = container.clientWidth * 0.72;
    nodeVideo.dataset.y = container.clientHeight * 0.15;

    updateTransforms();
    updateConnection();

    // Listeners for both nodes
    [nodeImage, nodeVideo].forEach(node => {
        node.addEventListener('mousedown', dragStart);
        node.addEventListener('touchstart', dragStart, {passive: false});
    });

    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, {passive: false});
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);
    window.addEventListener('resize', () => {
        updateConnection();
    });

    function dragStart(e) {
        // Find if target is inside node
        let targetNode = e.target.closest('.draggable');
        if (!targetNode) return;

        if (e.target.tagName.toLowerCase() === 'img' || e.target.tagName.toLowerCase() === 'video') {
            e.preventDefault(); // prevent native drag
        }
        
        isDragging = true;
        dragTarget = targetNode;
        dragTarget.style.cursor = 'grabbing';
        
        // Bring to front while dragging
        nodeImage.style.zIndex = '2';
        nodeVideo.style.zIndex = '2';
        dragTarget.style.zIndex = '10'; 
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        initialX = parseFloat(dragTarget.dataset.x) || 0;
        initialY = parseFloat(dragTarget.dataset.y) || 0;
    }

    function drag(e) {
        if (!isDragging || !dragTarget) return;
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        let newX = initialX + dx;
        let newY = initialY + dy;
        
        // boundary checks (keep nodes slightly inside)
        newX = Math.max(-50, Math.min(newX, container.clientWidth - dragTarget.clientWidth + 50));
        newY = Math.max(-50, Math.min(newY, container.clientHeight - dragTarget.clientHeight + 50));

        dragTarget.dataset.x = newX;
        dragTarget.dataset.y = newY;
        
        updateTransforms();
        updateConnection();
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        if (dragTarget) {
            dragTarget.style.cursor = 'grab';
        }
        dragTarget = null;
    }

    function updateTransforms() {
        nodeImage.style.transform = `translate(${nodeImage.dataset.x}px, ${nodeImage.dataset.y}px)`;
        nodeVideo.style.transform = `translate(${nodeVideo.dataset.x}px, ${nodeVideo.dataset.y}px)`;
    }

    function updateConnection() {
        // Calculate centers relative to container
        const cRect = container.getBoundingClientRect();
        const rect1 = nodeImage.getBoundingClientRect();
        const rect2 = nodeVideo.getBoundingClientRect();
        
        const x1 = rect1.right - cRect.left;
        const y1 = rect1.top + rect1.height / 2 - cRect.top;
        
        const x2 = rect2.left - cRect.left;
        const y2 = rect2.top + rect2.height / 2 - cRect.top;
        
        // Bezier control points (horizontal curve)
        const diffX = Math.abs(x2 - x1);
        const cp1x = x1 + diffX * 0.5;
        const cp1y = y1;
        const cp2x = x2 - diffX * 0.5;
        const cp2y = y2;
        
        const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        svgPath.setAttribute('d', path);
    }
    
    // Recalculate slightly later to ensure images/CSS have loaded
    setTimeout(() => {
        nodeImage.dataset.x = container.clientWidth * 0.38;
        nodeImage.dataset.y = container.clientHeight * 0.55 - (nodeImage.clientHeight / 2);
        
        nodeVideo.dataset.x = container.clientWidth * 0.72;
        nodeVideo.dataset.y = container.clientHeight * 0.15;
        updateTransforms();
        updateConnection();
    }, 200);
});
