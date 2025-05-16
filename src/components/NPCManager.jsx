import React from 'react';
import NPCForm from './NPCConfigForm';

class NPCManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      npcList: [],           // List of created NPCs
      player_enabled: false, // Flag to enable/disable player
      player_name: '',       // Name of the player
      npcImages: {},         // Images for each NPC
      editingIndex: null,    // Index of NPC being edited
      editingData: null      // Data of NPC being edited
    };
  }

  componentDidMount() {
    fetch('/assets/storage/npc_list.json')
      .then((res) => res.json())
      .then((data) => {
        this.setState({ npcImages: data });
      })
      .catch((err) => console.error('Failed to load NPC images', err));

    fetch('/assets/storage/npcs.json')
      .then((res) => res.json())
      .then((data) => {
        this.setState({ npcList: data });
      })
      .catch((err) => console.error('Failed to load NPC Data', err));
  }

  handleAddOrUpdateNPC = (npcData) => {
    const { editingIndex, npcList } = this.state;

    if (editingIndex !== null) {
      const updatedList = [...npcList];
      updatedList[editingIndex] = npcData;
      this.setState({ npcList: updatedList, editingIndex: null, editingData: null });
    } else {
      this.setState((prevState) => ({
        npcList: [...prevState.npcList, npcData],
      }));
    }
  };

  handleEditNPC = (index) => {
    const npcToEdit = this.state.npcList[index];
    this.setState({
      editingIndex: index,
      editingData: npcToEdit,
    });
  };

  handleDeleteNPC = (index) => {
    const newList = [...this.state.npcList];
    newList.splice(index, 1);
    this.setState({ npcList: newList });
  };

  handleSubmitAll = () => {
    this.props.onSubmit({
      npcList: this.state.npcList, 
      player_enabled: this.state.player_enabled,
      player_name: this.state.player_name
    });
  };

  render() {
    const { npcList, editingData, npcImages } = this.state;

    return (
      <div className="p-6 bg-gray-800 min-h-screen">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">NPC Manager</h1>
        {npcList.length > 0 && (
            <button
            onClick={this.handleSubmitAll}
            className="py-2 px-6 bg-green-600 hover:bg-green-500 rounded font-bold text-white"
            >
            ▶ Play
            </button>
        )}
        </div>

        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex-1 bg-gray-700 p-6 rounded shadow">
            <NPCForm onSubmit={this.handleAddOrUpdateNPC} defaultData={editingData} />
          </div>

          <div className="flex-1 bg-gray-700 p-6 rounded shadow">
            <h2 className="text-2xl font-bold text-white mb-4">Created NPCs</h2>
            {npcList.length === 0 ? (
              <p className="text-gray-400">No NPCs created yet.</p>
            ) : (
              <ul className="space-y-4">
                {npcList.map((npc, index) => (
                  <li
                    key={index}
                    className="p-4 bg-gray-600 rounded shadow flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      {npc.character && npcImages[npc.character] && (
                        <img
                          src={`/assets/characters/profile/${npcImages[npc.character]}`}
                          alt={`${npc.name}'s avatar`}
                          className="w-16 h-16 rounded-full border-2 border-gray-500 object-cover"
                        />
                      )}
                      <h3 className="text-xl font-bold text-white">{npc.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => this.handleEditNPC(index)}
                        className="py-1 px-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => this.handleDeleteNPC(index)}
                        className="py-1 px-3 bg-red-600 hover:bg-red-500 rounded font-bold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default NPCManager;
