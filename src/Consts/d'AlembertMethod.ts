import { Player } from "../Model/player";

export const dAlembertMethod = (player:Player):number => {
    // 最初のターン
    console.log("ダランベール" + `${player.getDAlembertCount}`)

    if (player.getPrevGameResult === null && player.getPrevGameResult === undefined || player.getPrevGameResult === ""){
        player.resetDAlembertCount = 1
        player.resetrecomendedBetAmount = 50
    }
    else if (player.getPrevGameResult === "lose" || player.getPrevGameResult === "bust" || player.getPrevGameResult === "surrender") {
        player.setDAlembertCount = 1
        player.setrecomendedBetAmount = player.getDAlembertCount
    }
    else{
        player.setDAlembertCount = -1
        player.resetrecomendedBetAmount = 50
        if (player.getDAlembertCount <= 0) player.setDAlembertCount = 1

    }
    return player.getrecomendedBetAmount;
}
