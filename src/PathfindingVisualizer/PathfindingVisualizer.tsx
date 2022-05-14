///////////////////////////////////////
// IMPORTING MODULES
///////////////////////////////////////

import React, { Component } from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import './PathfindingVisualizer.css';
import scatterRandom from '../algorithms/scatterRandom';
import $ from 'jquery';
import newMaze from '../algorithms/generateMaze';


let windowWidth = $(window).width() ;
let windowHeight = $(window).height();
if(!windowWidth){windowWidth = window.innerWidth;}
if(!windowHeight){windowHeight = window.innerHeight;}

let rows = Math.floor(windowHeight / 50);
let columns = Math.floor(windowWidth / 30);

let ROWS = rows; //16
let COLS = columns; //50
let START_NODE_COL = Math.floor(COLS / 2.5);
let START_NODE_ROW = Math.floor(ROWS / 2);
let FINISH_NODE_COL = Math.floor(COLS / 1.5);
let FINISH_NODE_ROW = Math.floor(ROWS / 2);
export { ROWS, COLS, START_NODE_COL, START_NODE_ROW, FINISH_NODE_COL, FINISH_NODE_ROW };

$(window).on('resize', function(){
  window.location.reload();
})

///////////////////////////////////////
// CLASS: PATHFINDINGVISUALIZER
///////////////////////////////////////

interface PathfindingVisualizerProps {
  grid: Array<Array<Node>>;
  rightMouseIsPressed: boolean;
  leftMouseIsPressed: boolean;
  isAnimationRunning: boolean;
  animationSpeed: number; 
}

export default class PathfindingVisualizer extends Component <any, any>{
  constructor(props: PathfindingVisualizerProps) {
    super(props);
    this.state = {
      grid: [],
      rightMouseIsPressed: false,
      leftMouseIsPressed: false,
      animationSpeed: 10,
      isAnimationRunning: false,
    };
  }

  ///////////////////////////////////////
  // FUNCTION: PATHFINDINGVISUALIZER ON MOUNT
  ///////////////////////////////////////
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
    window.onload = function(){
      //TODO: Implement remove and add wall with this, and add drag
      
      const nodes = document.querySelectorAll('.node')
      for(let i = 0; i < nodes.length; i++){
        nodes[i].addEventListener('mouseenter', function(e){
          nodes[i].classList.add('node-hover');
        })
        nodes[i].addEventListener('mouseleave', function(e){
          nodes[i].classList.remove('node-hover');
        })
      }
        /*
        nodes[i].addEventListener('mousedown', function(e){
          if(e.button === 0){
            console.log("left")
            console.log(e.target.id)
          }
          else if(e.button === 2){
            console.log("right")
          }
          
        })*/
      }
    }
    
  ///////////////////////////////////////
  // FUNCTION: PATHFINDINGVISUALIZER ON STATE RELOAD AND UPDATE
  ///////////////////////////////////////
  componentDidUpdate(prevProps : any, prevState : any){
    const { grid }  = this.state;

    document.addEventListener('keypress', (event) => {
      if (grid !== prevState.grid) {
        if (event.key === 's') {
          const nodeHTML = document.getElementsByClassName('node-hover')[0];
          if(nodeHTML){
            const row = nodeHTML.id.split('-')[1];
            const col = nodeHTML.id.split('-')[2];
            if(grid[row][col].isStart === false && grid[row][col].isFinish === false){
              const oldStartNode = document.getElementById(`node-${START_NODE_ROW}-${START_NODE_COL}`);
              if(oldStartNode){
                oldStartNode.classList.remove('node-start');
                grid[START_NODE_ROW][START_NODE_COL].isStart = false;
              }
                
              nodeHTML.classList.add('node-start');
              nodeHTML.classList.remove('node-hover');

              grid[row][col].isStart = true;
              grid[row][col].isWall = false
              
              START_NODE_ROW = parseInt(row);
              START_NODE_COL = parseInt(col);    
              }
            } 
          }else if (event.key === 'f') {
            const nodeHTML = document.getElementsByClassName('node-hover')[0];
            if(nodeHTML){
              const oldFinishNode = document.getElementById(`node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`);
              if(oldFinishNode){
                oldFinishNode.classList.remove('node-finish');
                grid[FINISH_NODE_ROW][FINISH_NODE_COL].isFinish = false;
              }
                
              nodeHTML.classList.add('node-finish');
              nodeHTML.classList.remove('node-hover');

              const row = nodeHTML.id.split('-')[1];
              const col = nodeHTML.id.split('-')[2];

              grid[row][col].isFinish = true;
              grid[row][col].isWall = false
              
              FINISH_NODE_ROW = parseInt(row);
              FINISH_NODE_COL = parseInt(col);
            }
          }
      }
      // Setting the state will reload, and it will make the application laggy
      // this.setState({ grid: grid });
    }
  );
}

  handleMouseRightDown(row : number, col : number) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid, rightMouseIsPressed: true});
  }


  handleMouseEnter(row : number, col : number) {
    if (!this.state.rightMouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp() {
    this.setState({rightMouseIsPressed: false});
  }

  setHTMLClass = (node : string, classNameString : string) => {
    const element = document.getElementById(node);
    if(element){
      const classNameArray = classNameString.split(' ');
      classNameArray.forEach(className => {
        element.classList.add(className);
        }); 
    } else {
      console.log("element not found")
    }
  }

  ///////////////////////////////////////
  // FUNCTION: ANIMATE DIJKSTRA
  ///////////////////////////////////////
  animateDijkstra(visitedNodesInOrder: Array<any>, nodesInShortestPathOrder: Array<any>, startNodeDistance : number) {
      //TODO: Make the speed change as the button is pressed even with animation playing
      const { animationSpeed } = this.state;
      for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
          setTimeout(() => {
            this.animateShortestPath(nodesInShortestPathOrder, startNodeDistance);
          }, animationSpeed * i);
          return;
        }
        setTimeout(() => {
          const node = visitedNodesInOrder[i];
          if(node.isStart === true){
            this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-visited node-img-start');
          }else if(node.isFinish === true){
            this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-visited node-img-finish');
          }else{
            this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-visited');
          }
        }, animationSpeed * i);
    }

  }

  ///////////////////////////////////////
  // FUNCTION: ANIMATE SHORTEST PATH 
  // BETWEEN START AND FINISH NODE
  ///////////////////////////////////////
  animateShortestPath(nodesInShortestPathOrder : Array<any>, startNodeDistance : any) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if(node.isStart === true){
          this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-shortest-path-right node-img-start');
        }else if(node.isFinish === true && startNodeDistance !== null){
          this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-shortest-path-right node-img-finish');
        }else{
          if(node.isFinish !== true && startNodeDistance !== null){
            let prevNode = nodesInShortestPathOrder[i - 1];
              if(prevNode !== undefined && prevNode !== null){
                const currentNode = nodesInShortestPathOrder[i];
                if(currentNode.col > prevNode.col){
                  this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-shortest-path-right');
                  // moved a column to right
                }else if(currentNode.col < prevNode.col){
                  this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-shortest-path-left');
                  // moved a column to left
                }else if(currentNode.row > prevNode.row){
                  this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-shortest-path-down');
                  // moved a row down
                }else if(currentNode.row < prevNode.row){
                  this.setHTMLClass(`node-${node.row}-${node.col}`, 'node node-shortest-path-up');
                  // moved a row up
                }
              }
            }
          }
        }, 50 * i);
    }

    setTimeout(() => {
      this.setState({isAnimationRunning: false});
    }, 1000)
  }

  ///////////////////////////////////////
  // FUNCTION: CLEAR GRID
  ///////////////////////////////////////
  clearGrid = () => {
    const { grid } = this.state;
    const algorithmTime = document.getElementById('algorithm-time');
    if(algorithmTime){
      algorithmTime.innerHTML = '';
    }

    for(let i  = 0; i < grid.length; i++){
      for(let j = 0; j < grid[0].length; j++){
        const node = grid[i][j];
        const nodeHTML = document.getElementById(`node-${node.row}-${node.col}`);
        node.isVisited = false;
        node.isWall = false;
        node.distance = Infinity;
        node.previousNode = null;
        if(nodeHTML){
          if(node.isStart === true){
            nodeHTML.className = 'node node-img-start';
          }else if(grid[i][j].isFinish === true){
            nodeHTML.className = 'node node-img-finish';
          }else if(grid[i][j].isWall === true){
            nodeHTML.className = 'node node-wall';
          }else{
            nodeHTML.className = 'node';
          }
        }
      }
    }
  }

  changeAnimationSpeed = () => {
    const animationSpeed = document.getElementById('change-speed');
    const changeSpeedIcon = document.getElementById('change-speed-icon'); 
    if(animationSpeed && changeSpeedIcon){ 
      if(animationSpeed.innerHTML === 'Slow' || animationSpeed.innerHTML === 'Change Speed'){
        animationSpeed.innerHTML = 'Medium';
        changeSpeedIcon.classList.add('fa-fast-forward')
        this.setState({animationSpeed: 40});
      }else if(animationSpeed.innerHTML === 'Medium'){
        animationSpeed.innerHTML = 'Fast';
        changeSpeedIcon.classList.add('fa-fast-backward')
        changeSpeedIcon.classList.remove('fa-fast-forward')
        this.setState({animationSpeed: 10});
      }else if(animationSpeed.innerHTML === 'Fast'){
        animationSpeed.innerHTML = 'Slow';
        changeSpeedIcon.classList.remove('fa-fast-backward')
        changeSpeedIcon.classList.add('fa-fast-forward')
        this.setState({animationSpeed: 90});
      }
    }
  };

  ///////////////////////////////////////
  // FUNCTION: VISUALIZE DIJKSTRA
  ///////////////////////////////////////
  visualizeDijkstra = () => {
    const { grid, isAnimationRunning } = this.state;
    if(isAnimationRunning === false){
      this.setState({isAnimationRunning: true});
      for(let i  = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
          const nodeHTML = document.getElementById(`node-${i}-${j}`);
          if(nodeHTML){
            if(grid[i][j].isStart === true){
              nodeHTML.className = 'node node-img-start';
            }else if(grid[i][j].isFinish === true){
              nodeHTML.className = 'node node-img-finish';
            }else if(grid[i][j].isWall === true){
              nodeHTML.className = 'node node-wall';
            }else{
              nodeHTML.className = 'node';
            }
            grid[i][j].distance = Infinity;
            grid[i][j].isVisited = false;
            grid[i][j].previousNode = null;
        }
          }
        }    

      const timeStart = performance.now();
      const startNode = grid[START_NODE_ROW][START_NODE_COL];
      const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
      const returnDijkstra = dijkstra(grid, startNode, finishNode);
      if(returnDijkstra){
        const startNodeDistance = returnDijkstra.startNodeDistance;
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        this.animateDijkstra(returnDijkstra.visitedNodesInOrder, nodesInShortestPathOrder, startNodeDistance);
        const timeEnd = performance.now();
        let string = ""
        if(startNodeDistance === null){
          string = "and can't reach the target node, it's enclosed into a box!"
        }else{
          string = `and took ${startNodeDistance} steps.`
        }
        const algorithmTime = document.getElementById('algorithm-time');  
        if(algorithmTime){
          algorithmTime.innerHTML = `Dijkstra's algorithm took ${(timeEnd - timeStart) / 1000} seconds to execute ${string}`;
        }
      }
    }
  }
  

  visualizeAstar = () => {
    const { grid } = this.state;
    for(let i  = 0; i < grid.length; i++){
      for(let j = 0; j < grid[i].length; j++){
        if(grid[i][j].isStart === true){
          this.setHTMLClass(`node-${i}-${j}`, 'node node-img-start');
        }else if(grid[i][j].isFinish === true){
          this.setHTMLClass(`node-${i}-${j}`, 'node node-img-finish');
        }else if(grid[i][j].isWall === true){
          this.setHTMLClass(`node-${i}-${j}`, 'node node-wall');
        }else{
          this.setHTMLClass(`node-${i}-${j}`, 'node');
        }
        grid[i][j].distance = Infinity;
        grid[i][j].isVisited = false;
        //grid[i][j].isWall = false;
        grid[i][j].previousNode = null;
        }
      }
      /*
    const timeStart = performance.now();
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const returnAstar = astar(grid, startNode, finishNode, 8);
    //const startNodeDistance = returnAstar.startNodeDistance;
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    //this.animateDijkstra(returnAstar.visitedNodesInOrder, nodesInShortestPathOrder);
    const timeEnd = performance.now();
    */
  }

  render() {
    const { grid } = this.state;
    return (
      <>
        <Navbar changeAnimationSpeed={this.changeAnimationSpeed} generateScatterRandom={this.generateScatterRandom} visualizeAstar={this.visualizeAstar} generateRandomMaze={this.generateRandomMaze} clearGrid={this.clearGrid} visualizeDijkstra={this.visualizeDijkstra}/>
        <div className="grid">
          {grid.map((row : any, rowIdx : number) => {
            return (
              <div key={rowIdx}>
                {row.map((node : any, nodeIdx : number) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      onMouseDown={(row : number, col : number) => this.handleMouseRightDown(row, col)}
                      onMouseEnter={(row : number, col : number) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        <TextArea secondaryText="Made by Neel Bansal" text="Dijkstra's algorithm is an algorithm for finding the shortest paths between nodes in a graph, it sets every nodes distance to Infinity, and then the main node searches up, down, left and right. It continues this throughout the execution. "/>
        <div className='note-wrapper'>   
          <Note node="true" title='Unvisited Node' iconClass='node' text='This is not the start, finish, or wall node; it is a node that has not yet been visited. This is normally how the probram begins, with none of the nodes visited.'/>
          <Note node="true" title='Start / Source Node' iconClass='node-start' text='The start node is where the program begins its search; it will make that the primary node and work its way to the solution from there. This can be changed by pressing the "s" key over a node.'/>
          <Note node="true" title='Finish / Target Node' iconClass='node-finish' text='The finish node is the one that the program is looking for and will attempt to locate. It will give an error if it is unable to locate it. This can be changed by pressing the "f" key over a node.'/>
          <Note node="true" title='Wall Node' iconClass='node-wall' text='The wall nodes prevent the program from searching in that area; they can also be used to demonstrate how roads can prevent cars from entering a specific location.'/>
          <Note node="true" title='Visited Node' iconClass='node-visited' text='The visited node is the node that the program has visited. It is the node that the program is currently on.'/>
          <Note node="true" title='Shortest Path Node' iconClass='node-shortest-path-right' text="The node that the program has visited is the visited node. It's the node where the software looked for the target node previously."/>
          <Note title="Grid" text='The grid is the area that the program searches. It is the area that the program searches for the target node.'>
            <div style={{display: 'left', padding: '50px 0px 0px 100px'}}>
              <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
              <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
              <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
            </div>

          <div style={{display: 'left', padding: '0px 10px 0px 100px'}}>
            <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
            <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
            <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
          </div>
          <div style={{display: 'left', padding: '0px 10px 30px 100px'}}>
            <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
            <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
            <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'table-cell', margin: '0% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className='node'></div>
          </div> 
          </Note>
        </div>
        <br></br>
        </>
    );
  }


  ///////////////////////////////////////
  // FUNCTION: GENERATE SCATTER RANDOM
  ///////////////////////////////////////
  
  generateScatterRandom = () =>{
    const { grid, isAnimationRunning } = this.state;
    if(!isAnimationRunning){
      const walledMaze = scatterRandom(grid)
      this.setState({
        grid: walledMaze
      })
  }
  }
  
  generateRandomMaze = () => {
    const { grid } = this.state;
    newMaze(grid);
    /*console.log(walledMaze);
    for(let i = 0; i < ROWS; i++){
      for(let j = 0; j < COLS; j++){
        if(walledMaze[0][i][j] === 1){
          grid[i][j].isWall = true;
        }else{
          grid[i][j].isWall = false;
        }
        grid[i][j].isWall = false;
        grid[i][j].isVisited = false;
        grid[i][j].distance = Infinity;
        grid[i][j].previousNode = null;
      }
    }*/
      }
}

///////////////////////////////////////
// CLASS: NAVBAR
///////////////////////////////////////

interface NavbarProps {
  clearGrid: any; 
  visualizeDijkstra : any;
  generateRandomMaze : any;
  visualizeAstar : any;
  generateScatterRandom  : any;
  changeAnimationSpeed : any;
} 

class Navbar extends Component <NavbarProps> {
  render() {
    let clearGrid = this.props.clearGrid;
    let visualizeDijkstra = this.props.visualizeDijkstra; 
    let generateRandomMaze = this.props.generateRandomMaze;    
    //let visualizeAstar = this.props.visualizeAstar;
    let generateScatterRandom = this.props.generateScatterRandom;
    let changeAnimationSpeed = this.props.changeAnimationSpeed;
    return (
      <div className="navbar-wrapper">
      <nav className="navbar navbar-dark navbar-expand justify-content-center">
    <div className="container">
        <ul className="navbar-nav nav-justified w-100 text-center mt-1">
        <li className="nav-item">
                <a href="#!" className="nav-link d-flex flex-column" data-toggle="collapse" onClick={() => visualizeDijkstra()}>
                    <span className="fa fa-map-marker fa-lg"></span>
                    <span className="d-none d-sm-inline mt-1">Dijkstra's Algorithm</span>
                </a>
            </li> 
            <li className="nav-item">
                <a href="#!" className="nav-link d-flex flex-column" data-toggle="collapse" onClick={() => generateScatterRandom()}>
                    <span className="fa fa-question fa-lg"></span>
                    <span className="d-none d-sm-inline mt-1">Generate Scatter</span>
                </a>
            </li>
            <li className="nav-item">
                <a href="#!" className="nav-link d-flex flex-column" data-toggle="collapse" onClick={() => changeAnimationSpeed()}>
                    <span id="change-speed-icon" className="fa fa-fast-forward fa-lg"></span>
                    <span id="change-speed" className="d-none d-sm-inline mt-1">Change Speed</span>
                </a>
            </li>
            <li className="nav-item">
                <a href="#!" className="nav-link d-flex flex-column" data-toggle="collapse" onClick={() => generateRandomMaze()}>
                    <span className="fa fa-microchip fa-lg"></span>
                    <span className="d-none d-sm-inline mt-1">New Maze (W.I.P)</span>
                </a>
            </li> 
            <li className="nav-item">
                <a href="#!" className="nav-link d-flex flex-column" data-toggle="collapse" onClick={() => clearGrid()}>
                    <span className="fa fa-th fa-lg"></span>
                    <span className="d-none d-sm-inline mt-1">Clear Grid</span>
                </a>
            </li>
        </ul>
    </div>
</nav>  
</div>
      
    );
  }
}
interface NoteProps{
  title?: string;
  text?: string;
  iconClass?: string;
  node?: string;
  children?: any;
}

class Note extends Component <NoteProps>{
  
  render() {
    const title = this.props.title;
    const text = this.props.text;
    const iconClass = this.props.iconClass;
    const node = this.props.node;
    let nodeDiv;
    if(node){
      nodeDiv = <div style={{width: '25px', height: '25px', outline: '1px solid rgb(175, 216, 248)', display: 'flex', margin: '15% 45%', justifyContent: 'center', alignItems: 'center', verticalAlign: 'text-bottom'}} className={iconClass}></div>
    }else{
      nodeDiv = null;
    }

    return (
      <div className="note-wrapper">
      <div className="card" style={{width: "18rem"}}>
        {this.props.children}
        {nodeDiv}
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{text}</p>
        </div>
      </div>
      </div>
    );
    }
}

///////////////////////////////////////
// CLASS: TEXTAREA
///////////////////////////////////////

interface TextAreaProps {
  text: string;
  secondaryText?: string;
}

class TextArea extends Component <TextAreaProps> {
  render() {
    const text = this.props.text
    const secondaryText = this.props.secondaryText
    return (
      <div className="note-wrapper">
        <div className="note">
          <p>{text}</p>
          <p id="algorithm-time"></p>
          <h6 style={{fontWeight: 'normal'}}>{secondaryText}</h6>
          </div>
      </div>
    );
  }
}

///////////////////////////////////////
// FUNCTION: GET INITIAL GRID
///////////////////////////////////////

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

///////////////////////////////////////
// FUNCTION: CREATE NODE
///////////////////////////////////////
const createNode = (col : number, row : number) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid: Array<any>, row : number, col : number) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
