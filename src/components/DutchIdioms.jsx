import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DutchIdioms = () => {
  const languages = [
    { value: 'dutch', label: 'Dutch' },
    { value: 'german', label: 'German' },
    { value: 'french', label: 'French' }
  ];

  const dutchIdioms = [
    {
      id: 1,
      original: "Nu komt de aap uit de mouw",
      pronunciation: "noo komt də aap ʌyt də maw",
      englishTranslation: "Now the monkey comes out of the sleeve",
      meaning: "The truth is finally revealed",
      usage: "Used when someone's true intentions or the real situation becomes clear",
      example: "After weeks of strange behavior, nu komt de aap uit de mouw - he's been planning a surprise party!",
    },
    {
      id: 2,
      original: "Het kost een arm en een been",
      pronunciation: "hεt kɔst ən ɑrm εn ən beːn",
      englishTranslation: "It costs an arm and a leg",
      meaning: "Something is very expensive",
      usage: "Used when complaining about high prices",
      example: "Die nieuwe iPhone kost een arm en een been!",
    },
    {
      id: 3,
      original: "Als een olifant in een porseleinkast",
      pronunciation: "ɑls ən oːlifɑnt ɪn ən pɔrsəlɛinkɑst",
      englishTranslation: "Like an elephant in a china shop",
      meaning: "Being very clumsy or tactless",
      usage: "When someone handles a delicate situation roughly",
      example: "Hij ging als een olifant in een porseleinkast door de discussie.",
    },
    {
      id: 4,
      original: "Met de kippen naar bed gaan",
      pronunciation: "mεt də kɪpən naːr bεt χaːn",
      englishTranslation: "Going to bed with the chickens",
      meaning: "Going to bed very early",
      usage: "Used when someone goes to sleep early in the evening",
      example: "Oma gaat altijd met de kippen naar bed - rond acht uur al!",
    },
    {
      id: 5,
      original: "Iemand de oren van het hoofd eten",
      pronunciation: "iːmɑnt də oːrən vɑn ət hoːft eːtən",
      englishTranslation: "To eat someone's ears off their head",
      meaning: "To eat a lot of someone's food",
      usage: "When guests eat a lot of food at someone's house",
      example: "Die teenagers eten me de oren van het hoofd!",
    },
    {
      id: 6,
      original: "Door de mand vallen",
      pronunciation: "doːr də mɑnt vɑlən",
      englishTranslation: "To fall through the basket",
      meaning: "To be exposed as a fraud or liar",
      usage: "When someone's lies or deception are discovered",
      example: "Hij viel door de mand toen we ontdekten dat hij nooit had gestudeerd.",
    },
    {
      id: 7,
      original: "Het regent pijpenstelen",
      pronunciation: "ət reːχənt pɛipənsteːlən",
      englishTranslation: "It's raining pipe stems",
      meaning: "It's raining very heavily",
      usage: "Used during heavy rainfall",
      example: "Neem een paraplu mee - het regent pijpenstelen!",
    },
    {
      id: 8,
      original: "Hemel en aarde bewegen",
      pronunciation: "heːməl εn aːrdə bəweːχən",
      englishTranslation: "To move heaven and earth",
      meaning: "To do everything possible to achieve something",
      usage: "When someone makes an extraordinary effort",
      example: "Ze heeft hemel en aarde bewogen om dat ticket te krijgen.",
    },
    {
      id: 9,
      original: "Een appeltje voor de dorst",
      pronunciation: "ən ɑpəltjə voːr də dɔrst",
      englishTranslation: "An apple for thirst",
      meaning: "Savings for future difficult times",
      usage: "Referring to having money saved for emergencies",
      example: "Ik hou altijd een appeltje voor de dorst achter.",
    },
    {
      id: 10,
      original: "De kat uit de boom kijken",
      pronunciation: "də kɑt ʌyt də boːm kɛikən",
      englishTranslation: "To watch the cat out of the tree",
      meaning: "To wait and see before taking action",
      usage: "When someone is being cautious before making a decision",
      example: "Bij nieuwe situaties kijkt hij altijd eerst de kat uit de boom.",
    }
  ];

  const [selectedLanguage, setSelectedLanguage] = useState('dutch');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Popular Idioms Explorer</CardTitle>
          <div className="w-[240px]">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dutchIdioms.map((idiom, index) => (
              <Card key={idiom.id} className="bg-white">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-blue-600">{idiom.original}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-mono">🔊</span>
                          <span className="font-mono">{idiom.pronunciation}</span>
                        </div>
                      </div>
                      <span className="text-lg font-medium text-gray-700">#{index + 1}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-800">
                        <span className="font-semibold">English:</span> {idiom.englishTranslation}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-semibold">Meaning:</span> {idiom.meaning}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-semibold">Usage:</span> {idiom.usage}
                      </p>
                      <p className="text-gray-700 italic bg-gray-50 p-2 rounded">
                        <span className="font-semibold">Example:</span> {idiom.example}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DutchIdioms;