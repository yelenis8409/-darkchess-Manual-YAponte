import React, { Component } from 'react';
import GameModel from '../models/GameModel';
import { Link } from 'react-router-dom';
import BASE_URL from '../Config';
import StoryModel from '../models/StoryModel';
import Game from '../components/Game';
import History from '../components/History';

interface StoryLevelProps {
    match: any
    history: any
}

interface StoryLevelState {
    story : StoryModel

    gameId? : string

    isGameOver: boolean
    isWhiteWinner: boolean

    maxLevels? : number
}

export default class StoryLevelView extends Component<StoryLevelProps, StoryLevelState> {

    constructor(props : StoryLevelProps) {
        super(props)

        this.state = {
            gameId : "",

            story: {
                id: "",
                title: "",
                description: "",
                level: 0,
            },
            isGameOver: false,
            isWhiteWinner: false
        }

        this.onGameOver = this.onGameOver.bind(this);
    }

    loadStory() { 
        var level = this.props.match.params.level;
        
        return fetch(`${BASE_URL}/api/v1/stories/${level}`)
          .then( (response) => {
              return response.json()
          })
          .then( (json : StoryModel) => {
            this.setState({story: json})
          }
        );
    }

    startStory() {
        var level = this.props.match.params.level;

        fetch(`${BASE_URL}/api/v1/stories/${level}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then( (game : GameModel) => {
            this.setState({
                gameId:game.id,
                isGameOver: false
            })
        })
    }

    calculateMaxLevels() {
        fetch(`${BASE_URL}/api/v1/stories`)
        .then( (response) => {
            return response.json()
        })
        .then( (json : StoryModel[]) => {
          this.setState({maxLevels: json.length})
        }
      );
    }

    componentDidMount() {
        this.loadStory();
        this.calculateMaxLevels();
    }

    onGameOver(isWhiteWinner: boolean) { 
        console.log("onGameOver")

        this.setState({
            isGameOver: true,
            isWhiteWinner
        })
    }

    componentDidUpdate(prevProps : StoryLevelProps) {
        console.log("componentdidupdate" + prevProps.match.params.level + " " + this.props.match.params.level);
        if (this.props.match.params.level != prevProps.match.params.level) {
          this.loadStory()
          .then( () => {
            console.log("setting game over")
            this.setState({
                gameId: "",
                isGameOver: false
            })
          })
        }
    }

    render() {
        var gameId = this.state.gameId;

        if (this.state.isGameOver && !this.state.isWhiteWinner && this.state.gameId) {
            return (<div>
                <h2>You lost...</h2>
                {/* <p>Review the game! <Link to={historyUrl}>Game Analysis</Link></p> */}
                <p>Let's try that again: <button className="btn btn-primary" onClick={this.startStory.bind(this)}>Retry Level</button></p>
                <h4>Review Game</h4>
                <hr></hr>
                <History gameId={this.state.gameId}></History>
            </div>);
        }

        if (this.state.isGameOver && (this.props.match.params.level != this.state.maxLevels)) {
            var winner = this.state.isWhiteWinner ? <p>White Wins!</p> : <p>Black wins!</p> 
            var historyUrl = `/history/${gameId}/0`
            var nextStoryLevel = `/story/` + (this.state.story.level + 1);

            if (this.state.isWhiteWinner && this.state.gameId) {
                return (<div>
                    <h2>You Win!!</h2>
                    {/* <p>Review the game! <Link to={historyUrl}>Game Analysis</Link></p> */}
                    <p>Proceed to next level! <Link className="btn btn-primary" to={nextStoryLevel}>Next Level</Link></p>
                    <h4>Review Game</h4>
                    <History gameId={this.state.gameId}></History>
                </div>);
            } 
        } else if (this.state.isGameOver && (parseInt(this.props.match.params.level) == this.state.maxLevels) && this.state.gameId) {
            var historyUrl = `/history/${gameId}/0`
            return (<div>
                <h3>Game Over!! You Beat the game!!</h3>
                <p>Love it? Like it? Hate it? Let me know! c0nrad@c0nrad.io</p>

                <History gameId={this.state.gameId}></History>
            </div>)
        }

        if (gameId) {   
            return (
                <div>                            
                    <h2>{this.state.story.title} <small>Level {this.state.story.level}</small></h2>
                    <p>{this.state.story.description}</p>
                    <Game showTitle={false} gameId={gameId} onGameOver={this.onGameOver}></Game>
                </div>
            )   
        } else {
            return (
                <div>                            
                    <h2>{this.state.story.title} <small>Level {this.state.story.level}</small></h2>
                    <p>{this.state.story.description}</p>
                    <button className="btn btn-primary" onClick={this.startStory.bind(this)}>Play Level</button>
                </div>
            )           
        }
    }

}
