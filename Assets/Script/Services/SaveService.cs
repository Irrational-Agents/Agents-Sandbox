public class SaveService {
    private readonly IDataRepository<WorldData> _worldRepository;

    public SaveService(IDataRepository<WorldData> worldRepository) {
        _worldRepository = worldRepository;
    }

    public void SaveGame(WorldData worldData) {
        _worldRepository.Save(worldData, GetWorldDataFilePath());
    }

    public WorldData LoadGame() {
        WorldData worldData = _worldRepository.Load(GetWorldDataFilePath());

        return (worldData);
    }

    private string GetWorldDataFilePath() {
        return "worldSave.json";
    }
}
