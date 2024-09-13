public interface IDataRepository<T> {
    void Save(T data, string filePath);
    T Load(string filePath);
}