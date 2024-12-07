export const saveSimForkConfig = (fork_name, scene) => {
    // TODO: Save data in server
    return getSimForkConfig(fork_name, scene)
}


export const getSimForkConfig = (fork_name, scene) => {
    // TODO: read data from server
    try {
        let data = scene.cache.json.get(fork_name)
        return data
    } catch(error) {
        throw error
    }
}

export const getNPCSDetails = (npcs_name, scene) => {
    return scene.cache.json.get("npc")
}

export const getPlayerDetails = (player_name, scene) => {
    return scene.cache.json.get("player")
}