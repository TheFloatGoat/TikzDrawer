var width;
var height;
var scl;
const moveAmount = 4;
const deletionAreaWidth = 20;
const nodeSize = 40;
let nodeArray = [];
let linkArray = [];
let selectedNode = null;
let movingNode = null;
let movingOffset = [0, 0];
let hitDetectionBuffer = null;
var can;

window.onresize = function() {
	width = Math.floor(window.innerWidth*2/3);
	height = window.innerHeight-60;
	scl = 13.7085 / width; // Usable space in cm devided by width [cm/px]
	can.size(width, height);
	hitDetectionBuffer = createGraphics(width, height);
};

function setup() {
	width = Math.floor(window.innerWidth*2/3);
	height = window.innerHeight-60;
	scl = 13.7085/width; // Usable space in cm devided by width [cm/px]
	hitDetectionBuffer = createGraphics(width, height);
	can = createCanvas(width, height);
	can.parent('sketch');
	nodeSettingsDiv = select('#nodeSettings');
	frameRate(60);
	setupUI();
}

function draw() {
	render();
	mouseStuff();
	tikzExport();
}

function keyPressed() {
	if(!lastMouseClickOnCanvas) {
		return;
	}

	if(key == 'x' || keyCode == 46) { //x or delete
		if(isANodeSelected()) {
			deleteNode(selectedNode);
		}
	}else if (key == 'H' || keyCode === LEFT_ARROW) {
		if(isANodeSelected()) {
			nodeArray[selectedNode].x -=gridSize;
		}
	}else if (key == 'L' || keyCode === RIGHT_ARROW) {
		if(isANodeSelected()) {
			nodeArray[selectedNode].x +=gridSize;
		}
	}else if (key == 'K' || keyCode === UP_ARROW) {
		if(isANodeSelected()) {
			nodeArray[selectedNode].y -=gridSize;
		}
	}else if (key == 'J' || keyCode === DOWN_ARROW) {
		if(isANodeSelected()) {
			nodeArray[selectedNode].y +=gridSize;
		}
	}
}

function isANodeSelected(){
	if (!selectedNode) {
		return false;
	}
	if (!nodeArray[selectedNode]) {
		return false;
	}
	return true;
}

function addNode(xPos, yPos, text, label, size, shape, fillColor) {
	nodeArray.push(new Node(xPos, yPos, text, label, size, shape, fillColor, true, true));
}

function toggleLink(from, to) {
	for (edge of linkArray) {
		if ((edge.from == from && edge.to ==to) || (edge.from == to && edge.to == from)) {
			deleteLink(edge.from, edge.to);
			return;
		}
	}
	addLink(from, to);
}

function deleteLink(from, to) {
	let index = findLinkIndex(from, to);
	if (index == null) {return;}
	linkArray.splice(index, 1);
}

function deleteLinkDirect(edge) {
	let index = linkArray.indexOf(edge);
	if (index == -1) {return;}
	linkArray.splice(index, 1);
}

function findLinkIndex(from, to) {
	for (index in linkArray) {
		let link = linkArray[index]
		if (link.from == from && link.to == to) {
			return index;
		}
	}
	return null;
}

//Doesn't actually delete, but rather erases all links and set's the nodes coords to null
function deleteNode(nodeIndex) {
	var node = nodeArray[nodeIndex];
	if (nodeIndex == movingNode) {
		movingNode = null;
	}
	//Delete Edge
	linkArray = linkArray.filter((edge) => edge.from != node && edge.to !=node);
	//Delete Node
	if(nodeIndex == selectedNode) {
		selectedNode = null;
	}
	nodeArray[nodeIndex] = null;
	closeNodeNav();

}

function addLink(from, to) {
	linkArray.push(new Edge(from, to, ""));
}

function searchNodes(x, y) {
	for (index in nodeArray) {
		let node = nodeArray[index];
		if (node == null) {
			continue;
		}

		let nodedist = node.getDist(x, y);

		if (nodedist <= 0) {
			// Found an exact match!
			return [index, node.x - x, node.y - y];
		}

		// nodeSize is the size of the new node
		if (nodedist <= nodeSize / 2) {
			// No exact match, but still too close to place a node here.
			return [-1];
		}
	}

	// No node found!
	return [-2];
}

function findMarkedEdge() {
	for (edge of linkArray) {
		if (edge.hover) {
			return edge;
		}
	}
	return null;
}
