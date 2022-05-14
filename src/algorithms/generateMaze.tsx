import { dijkstra } from '../algorithms/dijkstra';
import { ROWS, COLS, START_NODE_COL, START_NODE_ROW, FINISH_NODE_COL, FINISH_NODE_ROW} from '../PathfindingVisualizer/PathfindingVisualizer';

const newMaze = (grid : any) => {
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    console.log(grid)
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (i % 2 === 0 && j % 2 === 0 && grid[i][j].isStart === false && grid[i][j].isFinish === false) {
                grid[i][j].isWall = true;
                const nodeHTML = document.getElementById(`node-${i}-${j}`);
                if(nodeHTML){
                    nodeHTML.classList.add('node-wall');
                }
            }

            if(grid[i][j].col === 0 || grid[i][j].col === COLS - 1 || grid[i][j].row === 0 || grid[i][j].row === ROWS - 1){
                grid[i][j].isWall = true;
                const nodeHTML = document.getElementById(`node-${i}-${j}`);
                if(nodeHTML){
                    nodeHTML.classList.add('node-wall');
                }
            }
            if (grid[i][j].isWall === false && (i % 2 !== 0 || j % 2 !== 0) && grid[i][j].isStart === false && grid[i][j].isFinish === false) {
                const randomNumber = Math.floor(Math.random() * 5);
                if(randomNumber === 1){
                grid[i][j].isWall = true;
                const nodeHTML = document.getElementById(`node-${i}-${j}`);
                if(nodeHTML){
                    nodeHTML.classList.add('node-wall');
                }
            }
            }
            const returnDijkstra = dijkstra(grid, startNode, finishNode);
            if(returnDijkstra){
                console.log(returnDijkstra.startNodeDistance)
                if(returnDijkstra.startNodeDistance === null){
                    grid[i][j].isWall = false;
                    const nodeHTML = document.getElementById(`node-${i}-${j}`);
                    if(nodeHTML){
                        nodeHTML.classList.remove('node-wall');
                    }
                }
            }
        }
    }
}

export default newMaze;