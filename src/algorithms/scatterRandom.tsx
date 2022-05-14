const scatterRandom = (grid : Array<any>) => {
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
            const currentNode = grid[i][j];
            const currentNodeHTML = document.getElementById(`node-${i}-${j}`)
            if(currentNodeHTML){
              currentNodeHTML.classList.remove('node-shortest-path', 'node-visited')
              //Change the below number (6) to the probability of a node being a wall
              const wallOrNot = Math.floor((Math.random() * 6) + 1);
              
              if(wallOrNot === 1 && currentNode.isStart !== true && currentNode.isFinish !== true) {
                  currentNode.isWall = true;
              }else if(currentNode.isStart !== true && currentNode.isFinish !== true) {
                  currentNode.isWall = false;
              }
              
              if(currentNode.isVisited === true){
                console.log(document.getElementById(`node-${i}-${j}`))
                currentNode.isVisited = false;
              } 
            }
            
        }
    }
    return grid;
}

export default scatterRandom;

/*
document.getElementById('algorithm-time').innerHTML = '';
    for(let i  = 0; i < grid.length; i++){
      for(let j = 0; j < grid[0].length; j++){
        grid[i][j].isVisited = false;
        grid[i][j].isWall = false;
        grid[i][j].distance = Infinity;
        grid[i][j].previousNode = null;
        if(grid[i][j].isStart === true){
          document.getElementById(`node-${i}-${j}`).className = 'node node-img-start';
        }else if(grid[i][j].isFinish === true){
          document.getElementById(`node-${i}-${j}`).className = 'node node-img-finish';
        }else if(grid[i][j].isWall === true){
          document.getElementById(`node-${i}-${j}`).className = 'node node-wall';
        }else{
        document.getElementById(`node-${i}-${j}`).className =
          'node';
        }
*/

/*


for(let i  = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            console.log(board[i][j]);
        }}
  let currentIdX = 1;
  let currentIdY = 0;
  let relevantStatuses = ["start", "target", "object"];
  while (currentIdX > 0 && currentIdY < board.width) {
    let currentId = `${currentIdX}-${currentIdY}`;
    let currentNode = board.nodes[currentId];
    let currentHTMLNode = document.getElementById(currentId);
    if (!relevantStatuses.includes(currentNode.status)) {
      currentNode.status = "wall";
      board.wallsToAnimate.push(currentHTMLNode);
    }
    currentIdX--;
    currentIdY++;
  }
  while (currentIdX < board.height - 2 && currentIdY < board.width) {
    let currentId = `${currentIdX}-${currentIdY}`;
    let currentNode = board.nodes[currentId];
    let currentHTMLNode = document.getElementById(currentId);
    if (!relevantStatuses.includes(currentNode.status)) {
      currentNode.status = "wall";
      board.wallsToAnimate.push(currentHTMLNode);
    }
    currentIdX++;
    currentIdY++;
  }
  while (currentIdX > 0 && currentIdY < board.width - 1) {
    let currentId = `${currentIdX}-${currentIdY}`;
    let currentNode = board.nodes[currentId];
    let currentHTMLNode = document.getElementById(currentId);
    if (!relevantStatuses.includes(currentNode.status)) {
      currentNode.status = "wall";
      board.wallsToAnimate.push(currentHTMLNode);
    }
    currentIdX--;
    currentIdY++;
  }
*/