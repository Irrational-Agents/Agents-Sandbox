
UI address : https://orange-cliff-0b3a9151e.5.azurestaticapps.net/

Websocket address: ws://localhost:8080/

Request Format
{
    "command": command_name,
    "parameters": "..."
}


Commands that are currently configured

command.building.GetBuildings
command.chat.NPCChatUpdate
command.config.GetBuildingsConfig
command.config.GetEquipmentsConfig
command.config.GetNPCsConfig
command.map.GetMapScene
command.map.GetMapTown
command.map.UserNavigate
command.map.NPCNavigate
command.map.NPCNavigateTime
command.npc.GetNPCInfo
command.npc.GetNPCs
command.player.GetPlayerInfo
command.timetick.Tick