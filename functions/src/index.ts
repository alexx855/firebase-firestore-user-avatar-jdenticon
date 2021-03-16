/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as jdenticon from "jdenticon";
import * as fs from "fs";

// var serviceAccount = require("./serviceAccount.json");
// admin.initializeApp({
// credential: admin.credential.cert(serviceAccount),
//     storageBucket: "medievalgods.appspot.com"
// });

admin.initializeApp();

interface IUser {
    uid?: string;
    displayName?: string;
    photoURL?: string;
    email?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
}

// TODO: migrate this function to go, for fun
export const createProfileDisplayName = functions.auth.user().onCreate((user) => {
  const {uid} = user;

  // ? only colors and make it work with the jdenticon icon color
  const adjectives = ["Black", "White", "Gray", "Brown", "Red", "Pink", "Crimson", "Carnelian", "Orange", "Yellow", "Ivory", "Cream", "Green", "Viridian", "Aquamarine", "Cyan", "Blue", "Cerulean", "Azure", "Indigo", "Navy", "Violet", "Purple", "Lavender", "Magenta", "Rainbow"];
  const nouns = ["head", "crest", "crown", "tooth", "fang", "horn", "frill", "skull", "bone", "tongue", "throat", "voice", "nose", "snout", "chin", "eye", "sight", "seer", "speaker", "singer", "song", "chanter", "howler", "chatter", "shrieker", "shriek", "jaw", "bite", "biter", "neck", "shoulder", "fin", "wing", "arm", "lifter", "grasp", "grabber", "hand", "paw", "foot", "finger", "toe", "thumb", "talon", "palm", "touch", "racer", "runner", "hoof", "fly", "flier", "swoop", "roar", "hiss", "hisser", "snarl", "dive", "diver", "rib", "chest", "back", "ridge", "leg", "legs", "tail", "beak", "walker", "lasher", "swisher", "carver", "kicker", "roarer", "crusher", "spike", "shaker", "charger", "hunter", "weaver", "crafter", "binder", "scribe", "muse", "snap", "snapper", "slayer", "stalker", "track", "tracker", "scar", "scarer", "fright", "killer", "death", "doom", "healer", "saver", "friend", "foe", "guardian", "thunder", "lightning", "cloud", "storm", "forger", "scale", "hair", "braid", "nape", "belly", "thief", "stealer", "reaper", "giver", "taker", "dancer", "player", "gambler", "twister", "turner", "painter", "dart", "drifter", "sting", "stinger", "venom", "spur", "ripper", "swallow", "devourer", "knight", "lady", "lord", "queen", "king", "master", "mistress", "prince", "princess", "duke", "dutchess", "samurai", "ninja", "knave", "slave", "servant", "sage", "wizard", "witch", "warlock", "warrior", "jester", "paladin", "bard", "trader", "sword", "shield", "knife", "dagger", "arrow", "bow", "fighter", "bane", "follower", "leader", "scourge", "watcher", "cat", "panther", "tiger", "cougar", "puma", "jaguar", "ocelot", "lynx", "lion", "leopard", "ferret", "weasel", "wolverine", "bear", "raccoon", "dog", "wolf", "kitten", "puppy", "cub", "fox", "hound", "terrier", "coyote", "hyena", "jackal", "pig", "horse", "donkey", "stallion", "mare", "zebra", "antelope", "gazelle", "deer", "buffalo", "bison", "boar", "elk", "whale", "dolphin", "shark", "fish", "minnow", "salmon", "ray", "fisher", "otter", "gull", "duck", "goose", "crow", "raven", "bird", "eagle", "raptor", "hawk", "falcon", "moose", "heron", "owl", "stork", "crane", "sparrow", "robin", "parrot", "cockatoo", "carp", "lizard", "gecko", "iguana", "snake", "python", "viper", "boa", "condor", "vulture", "spider", "fly", "scorpion", "heron", "oriole", "toucan", "bee", "wasp", "hornet", "rabbit", "bunny", "hare", "brow", "mustang", "ox", "piper", "soarer", "flasher", "moth", "mask", "hide", "hero", "antler", "chill", "chiller", "gem", "ogre", "myth", "elf", "fairy", "pixie", "dragon", "griffin", "unicorn", "pegasus", "sprite", "fancier", "chopper", "slicer", "skinner", "butterfly", "legend", "wanderer", "rover", "raver", "loon", "lancer", "glass", "glazer", "flame", "crystal", "lantern", "lighter", "cloak", "bell", "ringer", "keeper", "centaur", "bolt", "catcher", "whimsey", "quester", "rat", "mouse", "serpent", "wyrm", "gargoyle", "thorn", "whip", "rider", "spirit", "sentry", "bat", "beetle", "burn", "cowl", "stone", "gem", "collar", "mark", "grin", "scowl", "spear", "razor", "edge", "seeker", "jay", "ape", "monkey", "gorilla", "koala", "kangaroo", "yak", "sloth", "ant", "roach", "weed", "seed", "eater", "razor", "shirt", "face", "goat", "mind", "shift", "rider", "face", "mole", "vole", "pirate", "llama", "stag", "bug", "cap", "boot", "drop", "hugger", "sargent", "snagglefoot", "carpet", "curtain"];

  function randomNoun(generator?: any) {
    generator = generator || Math.random;
    return nouns[Math.floor(generator() * nouns.length)];
  }

  function randomAdjective(generator?: any) {
    generator = generator || Math.random;
    return adjectives[Math.floor(generator() * adjectives.length)];
  }

  function generateStupidName(generator?: any) {
    const noun1 = randomNoun(generator);
    let noun2 = randomNoun(generator);
    noun2 = noun2.substr(0, 1).toUpperCase() + noun2.substr(1);
    const adjective = randomAdjective(generator);
    return adjective + noun1 + " " + noun2;
  }

  //  Random stupid name
  const displayName = generateStupidName();

  const iuser: IUser = {
    displayName,
  };

  // Update firestore
  return admin.firestore()
      .collection("users")
      .doc(uid)
      .set(iuser, {merge: true})
      .catch(console.error);
});

export const createProfileAvatar = functions.auth.user().onCreate((user) => {
  const {uid} = user;

  // ? save as png and optimize to reduce size
  // const png = jdenticon.toPng(uid, 300);
  const svg = jdenticon.toSvg(uid, 100);

  // Write the temp file
  const filePath = `/tmp/${uid}.svg`;
  fs.writeFile(filePath, svg, (error) => {
    if (error) {
      return console.error(error.message);
    }

    // TODO: upload directly to the user path .bucket().get()
    // Upload to Google Cloud Storage bucket.
    admin.storage().bucket().upload(filePath, (err, file) => {
      if (err) {
        return console.error(err.message);
      }

      // Move the file under the user path
      file?.move(`/users/${uid}/jdenticon.svg`)
      .catch(console.error);

      // Set user data to firestore
      const iuser: IUser = {
        photoURL: "jdenticon.svg",
      };

      // Remove tmp file
      fs.unlinkSync(filePath);

      // Update firestore
      return admin.firestore()
          .collection("users")
          .doc(uid)
          .set(iuser, {merge: true});
    });
  });
});
