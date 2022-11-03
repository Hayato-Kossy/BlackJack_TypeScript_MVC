import { View } from "../View/view";
import { Table } from "../Model/table";
import { Player } from "../Model/player";

export class Controller{

    static startGame():void{
        View.renderLoginPage();
        let startGameBtn:HTMLElement = View.config.gamePage!.querySelectorAll("#startGame")[0] as HTMLElement;
        startGameBtn.addEventListener("click", function(){
            let userName:string = View.config.gamePage!.querySelectorAll("input")[0].value;
            let table:Table = new Table(View.config.loginPage!.querySelectorAll("select")[0].value);
            if(userName === ""){
                alert("Please put your name");
            } 
            else{
                Controller.changePageAndSetPlayer(table, userName,table.getGameType);
            }
        });
    }

    static changePageAndSetPlayer(table:Table,userName:string,gameType:string):void{
        View.displayNone(View.config.loginPage);
        View.displayBlock(View.config.mainPage);
        table.setPlayers = userName;
        if (gameType === "blackjack") {
            table.blackjackAssignPlayerHands();
            Controller.controlTable(table);    
        }
    }

    static controlTable(table:Table):void{
        View.renderTable(table);
        let player:Player = table.getTurnPlayer
        if (table.getGamePhase !== "betting") {
            View.renderAllCountingLog(table);
            View.renderRecomendation(table);
        }
        if(player.getType === "user" && table.getGamePhase === "betting"){
            table.haveTurn(player.getBet);
            View.renderBetInfo(table);
            View.renderBetBtn(table);
        }
        else if(player.getType === "user" && table.getGamePhase === "acting"){
            if(player.getGameStatus === "bet" || player.getGameStatus === "hit"){

                if(player.isBlackJack() || player.getHandScore === 21){
                        table.haveTurn("stand");
                        Controller.controlTable(table)
                    }

                else{
                    View.updatePlayerInfo(table)
                    View.updateActionBetInfo(table);
                    if(player.getGameStatus === "hit") View.disableBtnAfterFirstAction();
                    View.renderCards(table, false);    
                }
            }
            else{
                table.haveTurn(player.getGameStatus);
                Controller.controlTable(table)
            }
            
        }
        else if(table.getGamePhase === "roundOver"){
            View.renderResult(table);
            View.renderLogResult(table);
        }

        else if(table.getGamePhase === "gameOver"){
            View.renderGameOver();
            View.renderAllLog(table);
        }
        else setTimeout(function(){
            table.haveTurn(table);
            Controller.controlTable(table)
        },1000);

    }

    static clickBetBtn(betCoin:number, player:Player):void{
        if(player.getChips >= betCoin){
            player.setBet = player.getBet + betCoin;
            player.setChips = player.getChips - betCoin;
        }
    }
}