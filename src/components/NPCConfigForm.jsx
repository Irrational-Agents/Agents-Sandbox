import { useEffect, useState } from 'react';

function NPCForm({ onSubmit, defaultData }) {
  const [npcData, setNpcData] = useState(() =>
    defaultData
      ? {
          ...defaultData,
          description: Array.isArray(defaultData.description)
            ? defaultData.description.join('\n')
            : defaultData.description,
        }
      : {
        name: '',
        birthday: '',
        spawn: '',
        character: '',
        description: '',
        personality_traits: {
          openness: 5,
          conscientiousness: 5,
          extraversion: 5,
          agreeableness: 5,
          neuroticism: 5,
        },
        skills: [
          { skill: '', level: 0 }
        ],
        goals: [
          { long_term: '' },
          { mid_term: [{ description: '', deadline: '' }] },
        ],
        social_relationships: {},
        important_memories: {
          favorite_programming_language: '',
          favorite_area_of_study: ''
        },
      }
  );
  

  const [npcList, setNpcList] = useState({});
  const [npcSpawn, setNpcSpawn] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (defaultData) {
      setNpcData({
        ...defaultData,
        description: Array.isArray(defaultData.description)
          ? defaultData.description.join('\n')
          : defaultData.description,
      });
    }
  }, [defaultData]);

  useEffect(() => {
    fetch('/assets/storage/spawn.json')
      .then((res) => res.json())
      .then(setNpcSpawn)
      .catch((err) => console.error('Failed to Set Spawn', err));
  }, []);

  useEffect(() => {
    fetch('/assets/storage/npc_list.json')
      .then((res) => res.json())
      .then(setNpcList)
      .catch((err) => console.error('Failed to load NPC list', err));
  }, []);

  useEffect(() => {
    const characterFile = npcList[npcData.character];
    if (characterFile) {
      setSelectedImage(`/assets/characters/profile/${characterFile}`);
    } else {
      setSelectedImage(null);
    }
  }, [npcData.character, npcList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNpcData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalityChange = (e) => {
    const { name, value } = e.target;
    setNpcData((prev) => ({
      ...prev,
      personality_traits: {
        ...prev.personality_traits,
        [name]: parseInt(value, 10),
      },
    }));
  };

  const handleSkillChange = (index, e) => {
    const { name, value } = e.target;
    const newSkills = [...npcData.skills];
    newSkills[index][name] = value;
    setNpcData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
  };

  const handleAddSkill = () => {
    setNpcData((prev) => ({
      ...prev,
      skills: [...prev.skills, { skill: '', level: 0 }],
    }));
  };

  const handleGoalChange = (index, e) => {
    const { name, value } = e.target;
    const newGoals = [...npcData.goals];
    if (index === 0) {
      newGoals[0][name] = value;
    } else {
      newGoals[1].mid_term[0][name] = value;
    }
    setNpcData((prev) => ({
      ...prev,
      goals: newGoals,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(npcData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-700 p-6 rounded-2xl shadow-xl w-full max-w-6xl space-y-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Create NPC</h2>

      {/* Basic Info */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="name" className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={npcData.name}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="birthday" className="block font-semibold mb-1">Birthday</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={npcData.birthday}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="spawn" className="block font-semibold mb-1">Spawn Location</label>
          <select
            id="spawn"
            name="spawn"
            value={npcData.spawn}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          >
            <option value="">-- Select Spawn --</option>
            {Object.entries(npcSpawn).map(([code, file]) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Character Selector + Image */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1">
          <label htmlFor="character" className="block font-semibold mb-1">Character</label>
          <select
            id="character"
            name="character"
            value={npcData.character}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          >
            <option value="">-- Select Character --</option>
            {Object.entries(npcList).map(([code, file]) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
        {selectedImage && (
          <div className="w-32 h-32 mt-2 md:mt-0">
            <img
              src={selectedImage}
              alt="NPC Preview"
              className="w-full h-full rounded-full border-2 border-gray-500 object-cover"
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block font-semibold mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          value={npcData.description}
          onChange={handleChange}
          rows="4"
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />
      </div>

      {/* Personality Traits */}
      <div>
        <label className="block font-semibold mb-2">Personality Traits</label>
        <div className="flex flex-wrap gap-4">
          {Object.entries(npcData.personality_traits).map(([trait, value]) => (
            <div key={trait} className="flex flex-col w-40">
              <label htmlFor={trait} className="capitalize font-medium">{trait}</label>
              <input
                type="number"
                id={trait}
                name={trait}
                value={value}
                onChange={handlePersonalityChange}
                min="1"
                max="10"
                className="p-2 rounded bg-gray-800 border border-gray-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block font-semibold mb-2">Skills</label>
        {npcData.skills.map((skill, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 mb-2">
            <input
              type="text"
              name="skill"
              value={skill.skill}
              onChange={(e) => handleSkillChange(index, e)}
              placeholder="Skill"
              required
              className="flex-1 p-2 rounded bg-gray-800 border border-gray-600"
            />
            <input
              type="number"
              name="level"
              value={skill.level}
              onChange={(e) => handleSkillChange(index, e)}
              min="0"
              max="10"
              placeholder="Level"
              required
              className="flex-1 p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddSkill}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
        >
          Add Skill
        </button>
      </div>


      {/* Goals */}
      <div>
        <label className="block font-semibold mb-2">Goals</label>
        <input
          type="text"
          name="long_term"
          value={npcData.goals[0].long_term}
          onChange={(e) => handleGoalChange(0, e)}
          placeholder="Long Term Goal"
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 mb-2"
        />
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="description"
            value={npcData.goals[1].mid_term[0].description}
            onChange={(e) => handleGoalChange(1, e)}
            placeholder="Mid Term Goal"
            required
            className="flex-1 p-2 rounded bg-gray-800 border border-gray-600"
          />
          <input
            type="date"
            name="deadline"
            value={npcData.goals[1].mid_term[0].deadline}
            onChange={(e) => handleGoalChange(1, e)}
            required
            className="flex-1 p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-2 bg-green-600 hover:bg-green-500 rounded font-bold"
      >
        Create NPC
      </button>
    </form>
  );
}

export default NPCForm;
