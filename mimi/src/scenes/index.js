// Lista tuturor scenelor jocului. O scenă nouă se adaugă aici.
import { menuScene } from './menu.js';
import { homeScene } from './home.js';
import { parentsScene, restScene } from './parents.js';
import { atelierScene } from './atelier.js';
import { salonScene, bathScene } from './salon.js';
import { kitchenScene, bedroomScene, mapScene } from './care.js';
import { wardrobeScene } from './wardrobe.js';
import { roomScene } from './room.js';
import { shopScene } from './shop.js';
import { questsScene } from './quests.js';
import { runwayScene } from './runway.js';
import { photoScene, albumScene } from './photo.js';
import { tailorScene } from './tailor.js';
import { GAME_SCENES } from './games.js';

export const SCENES = [
  menuScene, homeScene, parentsScene, restScene, atelierScene, salonScene, wardrobeScene,
  roomScene, shopScene, bathScene, kitchenScene, bedroomScene, mapScene, questsScene, runwayScene, photoScene, albumScene, tailorScene, ...GAME_SCENES,
];
