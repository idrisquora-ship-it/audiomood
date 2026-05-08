import TrackPlayer from "react-native-track-player";

TrackPlayer.registerPlaybackService(() => require("./src/services/playbackService"));

import "expo-router/entry";
