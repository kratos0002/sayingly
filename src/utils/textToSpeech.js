export const playTextToSpeech = async (text, voiceId = 'en_us_male1', apiKey = 'SogkG57gf3HTtumB7ZJVswwOZgNcFQJ23OQCxUW4fpsCTLIsjD98rg') => {
  const UNREAL_SPEECH_API_URL = 'https://api.unrealspeech.com/tts';

  try {
    const response = await fetch(UNREAL_SPEECH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // Authorization header
      },
      body: JSON.stringify({
        voice_id: voiceId, // Voice ID, adjust as needed
        text: text,
        speed: 1.0, // Speech speed, default is 1.0
      }),
    });

    const data = await response.json();

    if (data.audio_url) {
      const audio = new Audio(data.audio_url); // Play audio from the URL
      audio.play();
    } else {
      console.error('Unreal Speech Error:', data);
    }
  } catch (error) {
    console.error('Failed to call Unreal Speech API:', error);
  }
};
