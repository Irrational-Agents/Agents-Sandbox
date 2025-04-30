import React, { useState, useEffect } from 'react';

const BaseConfigForm = ({ onSubmit }) => {
  const [simType, setSimType] = useState('play');
  const [startTime, setStartTime] = useState(() =>
    new Date().toTimeString().split(' ')[0].slice(0, 5)
  );
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [stepsPerMin, setStepsPerMin] = useState(60);
  const [totalSteps, setTotalSteps] = useState(1000);
  const [endTime, setEndTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [replayId, setReplayId] = useState('sample');
  

  const isReplay = simType === 'replay';

  useEffect(() => {
    if (!isReplay) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const [year, month, day] = startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day, hours, minutes);
  
      const totalMinutes = totalSteps / stepsPerMin;
      const end = new Date(start.getTime() + totalMinutes * 60000);
  
      const formattedEndTime = end.toTimeString().split(' ')[0].slice(0, 5);
      const formattedEndDate = end.toISOString().split('T')[0];
  
      setEndTime(formattedEndTime);
      setEndDate(formattedEndDate);
    }
  }, [startTime, startDate, stepsPerMin, totalSteps, isReplay]);
  

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = isReplay
      ? { sim_type: simType, replay_id: replayId }
      : {
          sim_type: simType,
          map_name: e.target.map_name.value,
          start_date: e.target.start_date.value,
          start_time: startTime,
          steps_per_min: stepsPerMin,
          total_steps: totalSteps,
          end_time: endTime,
          end_date: endDate
        };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-700 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
      <div>
        <label htmlFor="sim_type" className="block font-semibold mb-1">Simulation Type</label>
        <select
          name="sim_type"
          id="sim_type"
          value={simType}
          onChange={(e) => setSimType(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        >
          <option value="play">Play</option>
          <option value="replay">Replay</option>
        </select>
      </div>

      {isReplay ? (
        <>
          <h2 className="text-2xl font-bold mb-2">Select Replay</h2>
          <div>
            <label htmlFor="replay_id" className="block font-semibold mb-1">Replay ID</label>
            <input
              type="text"
              name="replay_id"
              id="replay_id"
              value={replayId}
              onChange={(e) => setReplayId(e.target.value)}
              required
              placeholder="e.g. replay_001"
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="map_name" className="block font-semibold mb-1">Map</label>
            <select
              name="map_name"
              id="map_name"
              required
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            >
              <option value="the_ville">The Ville</option>
            </select>
          </div>

          <div>
            <label htmlFor="start_date" className="block font-semibold mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              id="start_date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="start_time" className="block font-semibold mb-1">Start Time</label>
            <input
              type="time"
              name="start_time"
              id="start_time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="steps_per_min" className="block font-semibold mb-1">Steps Per Minute</label>
            <input
              type="number"
              name="steps_per_min"
              id="steps_per_min"
              min="1"
              value={stepsPerMin}
              onChange={(e) => setStepsPerMin(Number(e.target.value))}
              required
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="total_steps" className="block font-semibold mb-1">Total Steps</label>
            <input
              type="number"
              name="total_steps"
              id="total_steps"
              min="1"
              value={totalSteps}
              onChange={(e) => setTotalSteps(Number(e.target.value))}
              required
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="end_time" className="block font-semibold mb-1">End Time (calculated)</label>
            <input
              type="time"
              name="end_time"
              id="end_time"
              value={endTime}
              readOnly
              className="w-full p-2 rounded bg-gray-600 border border-gray-600 text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block font-semibold mb-1">End Date (calculated)</label>
            <input
              type="date"
              name="end_date"
              id="end_date"
              value={endDate}
              readOnly
              className="w-full p-2 rounded bg-gray-600 border border-gray-600 text-gray-300 cursor-not-allowed"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className={`w-full py-2 rounded font-bold ${isReplay ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {isReplay ? 'Load Replay' : 'Next'}
      </button>
    </form>
  );
};

export default BaseConfigForm;
