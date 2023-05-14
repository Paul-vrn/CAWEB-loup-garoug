import { Slider } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, IndexPath, Input, Layout, Select, SelectItem } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { Dispatch, SetStateAction, useState } from "react";
import React, { Image, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { NewGame as NewGameType, StateGame } from "types";
import { createGame } from "../../utils/api/game";
import useFont from "../../utils/hooks/useFont";

import wolfIcon from "../../../assets/Player/wolf.png";
import contaminatorIcon from "../../../assets/Powers/contaminator.png";
import eyeIcon from "../../../assets/Powers/eye.png";
import seerIcon from "../../../assets/Powers/seer.png";
import spiritIcon from "../../../assets/Powers/spirit.png";
import sunIcon from "../../../assets/UI/day.png";
import downIcon from "../../../assets/UI/down_arrow.png";
import maxPlayerIcon from "../../../assets/UI/max_player.png";
import minPlayerIcon from "../../../assets/UI/min_player.png";
import nameIcon from "../../../assets/UI/name.png";
import nightIcon from "../../../assets/UI/night.png";
import imgCalendar from "../../../assets/UI/start-date.png";
import upIcon from "../../../assets/UI/up_arrow.png";

const NewGame = () => {
  const fontsLoaded = useFont();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  /* General settings */
  const minPlayers = 5;
  const maxPlayers = 20;
  const queryClient = useQueryClient();
  const [gameName, setGameName] = useState("Game name");
  const [gameNameStatus, setGameNameStatus] = useState("basic");
  const [minPlayersIndex, setMinPlayersIndex] = useState<IndexPath | IndexPath[]>(new IndexPath(0));
  const [maxPlayersIndex, setMaxPlayersIndex] = useState<IndexPath | IndexPath[]>(
    new IndexPath(maxPlayers - minPlayers)
  );
  /* Time picking states */
  const [startDay, setStartDay] = useState<Date>(new Date(1970, 0, 1, 8, 0, 0, 0));
  const [startDayVisibility, setStartDayVisibility] = useState<boolean>(false);

  const [endDay, setEndDay] = useState<Date>(new Date(1970, 0, 1, 20, 0, 0, 0));
  const [startEndVisibility, setEndDayVisibility] = useState<boolean>(false);

  const [deadline, setDeadline] = useState<Date>(new Date(Date.now()));
  const [startDatelineVisibility, setStartDatelineVisibility] = useState<boolean>(false);

  /* Probabilities */
  const [wolfProb, setWolfProb] = useState<number>(33);
  const [seerProb, setSeerProb] = useState<number>(15);
  const [insomProb, setInsomProb] = useState<number>(15);
  const [contProb, setContProb] = useState<number>(15);
  const [spiritProb, setSpiritProb] = useState<number>(15);

  const toggleView = () => {
    setIsVisible(!isVisible);
  };

  /* Special time callbacks */
  const confirmStartDay = (date: Date) => {
    if (
      endDay.getHours() > date.getHours() ||
      (endDay.getHours() === date.getHours() && endDay.getMinutes() > date.getMinutes())
    ) {
      setStartDay(new Date(date.getTime()));
    }
    setStartDayVisibility(false);
  };
  const confirmEndDay = (date: Date) => {
    if (
      date.getHours() > startDay.getHours() ||
      (date.getHours() === startDay.getHours() && date.getMinutes() > startDay.getMinutes())
    ) {
      setEndDay(new Date(date.getTime()));
    }
    setEndDayVisibility(false);
  };
  const hideTimePicker = (setter: Dispatch<SetStateAction<boolean>>) => {
    setter(false);
  };
  const setTimeWeb = (time: string, setter: Dispatch<SetStateAction<Date>>) => {
    const [hours, minutes] = time.split(":"); // extraction des heures et minutes
    const date = new Date(0);
    date.setHours(Number(hours), Number(minutes), 0, 0); // définit l'heure spécifiée
    setter(date);
  };
  const getTimeString = (hours: number, minutes: number): string => {
    return ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2);
  };
  const getDateString = (date: Date): string => {
    return (
      "" +
      date.getFullYear() +
      "-" +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + date.getDate()).slice(-2)
    );
  };
  /* Api call */
  const { mutate } = useMutation<any, Error, NewGameType>({
    mutationFn: game => createGame(game),
    retry: 2,
    onSuccess: () => {
      queryClient.invalidateQueries(["mygames"]);
      router.back();
    },
    onError: () => {
      console.log("Error");
      setGameNameStatus("danger");
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  const newGame = async () => {
    if (gameName.trim() === "") {
      setGameNameStatus("danger");
      return;
    }
    const startDayString = getTimeString(startDay.getHours(), startDay.getMinutes()) + ":00";
    const endDayString = getTimeString(endDay.getHours(), endDay.getMinutes()) + ":00";
    const game: NewGameType = {
      name: gameName,
      state: StateGame.LOBBY,
      minPlayer: +minPlayersIndex.toString() + minPlayers - 1,
      maxPlayer: +maxPlayersIndex.toString() + minPlayers - 1,
      deadline: getDateString(deadline) + "T" + startDayString + ".000Z",
      startDay: "1970-01-01T" + startDayString + ".000Z",
      endDay: "1970-01-01T" + endDayString + ".000Z",
      wolfProb: wolfProb / 100,
      seerProb: seerProb / 100,
      insomProb: insomProb / 100,
      contProb: contProb / 100,
      spiritProb: spiritProb / 100,
    };
    mutate(game);
  };
  return (
    <SafeAreaView style={styles.body}>
      <ScrollView>
        {/* Page de création de la partie */}
        <Layout level="1" style={[styles.container]}>
          <View style={styles.viewWrapper}>
            <View style={styles.wrapperTitle}>
              <View style={styles.line}>
                <Text> </Text>
              </View>
              <Text style={styles.h2}>New Game</Text>
            </View>
            <View style={styles.wrapperSelect}>
              <View style={styles.wrapperImageText}>
                <View style={styles.imageWrapper}>
                  <Image source={nameIcon} style={styles.icon} />
                </View>
                <Text style={styles.text}>Game's name:</Text>
              </View>
              <Input
                style={styles.input}
                status={gameNameStatus}
                placeholder={"Millers Hollow"}
                onChangeText={setGameName}
                testID="name-new-game-input"
              />
            </View>

            <View style={styles.wrapperSelect}>
              <View style={styles.wrapperImageText}>
                <View style={styles.imageWrapper}>
                  <Image source={minPlayerIcon} style={styles.icon} />
                </View>
                <Text style={styles.text}>Min players:</Text>
              </View>
              <Select
                placeholder="Default"
                style={styles.input}
                value={+minPlayersIndex.toString() + minPlayers - 1}
                selectedIndex={minPlayersIndex}
                testID="minimum-players-select"
                onSelect={index => {
                  setMinPlayersIndex(index);
                  if (Number(maxPlayersIndex.toString()) < Number(index.toString())) {
                    setMaxPlayersIndex(index);
                  }
                }}
              >
                {Array.from(Array(maxPlayers).keys())
                  .slice(minPlayers - 1)
                  .map(n => (
                    <SelectItem key={n} title={n + 1 + ""} />
                  ))}
              </Select>
            </View>
            <View style={styles.wrapperSelect}>
              <View style={styles.wrapperImageText}>
                <View style={styles.imageWrapper}>
                  <Image source={maxPlayerIcon} style={styles.icon} />
                </View>
                <Text style={styles.text}>Max players:</Text>
              </View>
              <Select
                style={styles.input}
                placeholder={maxPlayers}
                value={Number(maxPlayersIndex.toString()) + minPlayers - 1}
                selectedIndex={maxPlayersIndex}
                testID="maximum-players-select"
                onSelect={index => setMaxPlayersIndex(index)}
              >
                {Array.from(Array(maxPlayers).keys())
                  .slice(minPlayers - 1)
                  .map(n => (
                    <SelectItem
                      key={n}
                      disabled={n < Number(minPlayersIndex.toString()) - 1 + minPlayers - 1}
                      title={n + 1 + ""}
                    />
                  ))}
              </Select>
            </View>
            <View id="dateline" style={styles.wrapperSelect}>
              <View style={styles.wrapperImageText}>
                <View style={styles.imageWrapper}>
                  <Image source={imgCalendar} style={styles.icon} />
                </View>
                <Text style={styles.text}>Start date:</Text>
              </View>
              <Button style={styles.timeButton} onPress={() => setStartDatelineVisibility(true)}>
                {deadline.getDate() +
                  "/" +
                  (deadline.getMonth() + 1) +
                  "/" +
                  deadline.getFullYear()}
              </Button>
            </View>
            {Platform.OS === "web" ? (
              <Input
                style={styles.timeButton}
                onChangeText={text => setDeadline(new Date(text))}
                placeholder="MM-DD-YYYY"
                testID="start-date-input"
              />
            ) : (
              <DateTimePickerModal
                minimumDate={new Date()}
                date={deadline}
                isVisible={startDatelineVisibility}
                onConfirm={(date: Date) => {
                  setStartDatelineVisibility(false);
                  setDeadline(date);
                }}
                onCancel={() => hideTimePicker(setStartDatelineVisibility)}
              />
            )}

            <View id="startday" style={[styles.wrapperSelect]}>
              <View style={styles.wrapperImageText}>
                <View style={styles.imageWrapper}>
                  <Image source={sunIcon} style={styles.icon} />
                </View>
                <Text style={styles.text}>Day's start time:</Text>
              </View>
              {Platform.OS === "web" ? (
                <Input
                  style={styles.timeButton}
                  onChangeText={text => setTimeWeb(text, setStartDay)}
                  placeholder="HH:MM"
                  testID="startday-input"
                />
              ) : (
                <Button style={styles.timeButton} onPress={() => setStartDayVisibility(true)}>
                  {getTimeString(startDay.getHours(), startDay.getMinutes())}
                </Button>
              )}
            </View>
            <DateTimePickerModal
              mode="time"
              is24Hour={true}
              minuteInterval={5}
              isVisible={startDayVisibility}
              onConfirm={confirmStartDay}
              onCancel={() => hideTimePicker(setStartDayVisibility)}
            />
            <View id="endday" style={[styles.wrapperSelect, styles.lastSelect]}>
              <View style={styles.wrapperImageText}>
                <View style={styles.imageWrapper}>
                  <Image source={nightIcon} style={styles.icon} />
                </View>
                <Text style={styles.text}>Day's end time:</Text>
              </View>
              {Platform.OS === "web" ? (
                <Input
                  style={styles.timeButton}
                  onChangeText={text => setTimeWeb(text, setEndDay)}
                  placeholder="HH:MM"
                  testID="endday-input"
                />
              ) : (
                <Button style={styles.timeButton} onPress={() => setEndDayVisibility(true)}>
                  {getTimeString(endDay.getHours(), endDay.getMinutes())}
                </Button>
              )}
            </View>
            <DateTimePickerModal
              mode="time"
              is24Hour={true}
              minuteInterval={5}
              isVisible={startEndVisibility}
              onConfirm={confirmEndDay}
              onCancel={() => hideTimePicker(setEndDayVisibility)}
            />
            {isVisible && (
              <View>
                {/* Sliders */}
                <View style={[styles.wrapperSelectIcon, styles.firstSelect]}>
                  <View style={styles.wrapperImageText}>
                    <View style={styles.imageWrapper}>
                      <Image source={wolfIcon} style={styles.icon} />
                    </View>
                    <Text style={styles.text}>Wolf probability: {wolfProb}%</Text>
                  </View>
                </View>
                <Slider
                  thumbStyle={styles.thumbSlider}
                  allowTouchTrack={true}
                  minimumTrackTintColor="#fffaf5"
                  maximumTrackTintColor="#18181a"
                  animationType="timing"
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={setWolfProb}
                  value={wolfProb}
                  step={1}
                />
                {/* Contamination Prob */}
                <View style={styles.wrapperSelectIcon}>
                  <View style={styles.wrapperImageText}>
                    <View style={styles.imageWrapper}>
                      <Image source={contaminatorIcon} style={styles.icon} />
                    </View>
                    <Text style={styles.text}>Contamination probability: {contProb}%</Text>
                  </View>
                </View>
                <Slider
                  thumbStyle={styles.thumbSlider}
                  allowTouchTrack={true}
                  minimumTrackTintColor="#fffaf5"
                  maximumTrackTintColor="#18181a"
                  animationType="timing"
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={setContProb}
                  value={contProb}
                  step={1}
                />
                {/* Seer Prob */}
                <View style={styles.wrapperSelectIcon}>
                  <View style={styles.wrapperImageText}>
                    <View style={styles.imageWrapper}>
                      <Image source={seerIcon} style={styles.icon} />
                    </View>
                    <Text style={styles.text}>Seer probability: {seerProb}%</Text>
                  </View>
                </View>
                <Slider
                  thumbStyle={styles.thumbSlider}
                  allowTouchTrack={true}
                  minimumTrackTintColor="#fffaf5"
                  maximumTrackTintColor="#18181a"
                  animationType="timing"
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={setSeerProb}
                  value={seerProb}
                  step={1}
                />
                {/* Insomniac Prob */}
                <View style={styles.wrapperSelectIcon}>
                  <View style={styles.wrapperImageText}>
                    <View style={styles.imageWrapper}>
                      <Image source={eyeIcon} style={styles.icon} />
                    </View>
                    <Text style={styles.text}>Insomniac probability: {insomProb}%</Text>
                  </View>
                </View>
                <Slider
                  thumbStyle={styles.thumbSlider}
                  allowTouchTrack={true}
                  minimumTrackTintColor="#fffaf5"
                  maximumTrackTintColor="#18181a"
                  animationType="timing"
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={setInsomProb}
                  value={insomProb}
                  step={1}
                />
                {/* Spirit Prob */}
                <View style={styles.wrapperSelectIcon}>
                  <View style={styles.wrapperImageText}>
                    <View style={styles.imageWrapper}>
                      <Image source={spiritIcon} style={styles.icon} />
                    </View>
                    <Text style={styles.text}>Spirit probability: {spiritProb}%</Text>
                  </View>
                </View>
                <Slider
                  thumbStyle={styles.thumbSlider}
                  allowTouchTrack={true}
                  minimumTrackTintColor="#fffaf5"
                  maximumTrackTintColor="#18181a"
                  animationType="timing"
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={setSpiritProb}
                  value={spiritProb}
                  step={1}
                  style={styles.spiritSlider}
                />
              </View>
            )}
            <Button onPress={toggleView} style={styles.toggleButton}>
              {() =>
                isVisible ? (
                  <View style={styles.toggleView}>
                    <Text style={styles.toggleText}>Hide advanced settings</Text>
                    <Image source={upIcon} style={styles.toggleIcon} />
                  </View>
                ) : (
                  <View style={styles.toggleView}>
                    <Text style={styles.toggleText}>Show advanced settings</Text>
                    <Image source={downIcon} style={styles.toggleIcon} />
                  </View>
                )
              }
            </Button>
            <Button onPress={async () => await newGame()} style={styles.button}>
              {evaProps => (
                <Text {...evaProps} style={styles.buttonText}>
                  Create game
                </Text>
              )}
            </Button>
          </View>
        </Layout>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#141313",
  },
  container: {
    display: "flex",
    padding: 0,
    backgroundColor: "#141313",
    flex: 1,
    height: "100%",
  },
  wrapperTitle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "10%",
  },
  viewWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: "10%",
    paddingRight: "10%",
    flex: 1,
    marginTop: "5%",
  },
  wrapperSelect: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  wrapperSelectIcon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: -10,
    marginTop: 5,
  },
  wrapperImageText: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  imageWrapper: {
    width: 50,
    height: 50,
    marginRight: -10,
  },
  firstSelect: {
    marginTop: 15,
  },
  lastSelect: {
    marginBottom: 20,
  },
  spiritSlider: {
    marginBottom: 5,
  },
  innerButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    flex: 1,
    resizeMode: "contain",
    width: 30,
    height: 30,
  },
  toggleIcon: {
    flex: 1,
    resizeMode: "contain",
    width: 20,
    height: 20,
  },
  toggleButton: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    marginBottom: "5%",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#141313",
    fontFamily: "MontserratBold",
  },
  button: {
    marginBottom: "15%",
    backgroundColor: "#C38100",
    borderRadius: 24,
  },
  text: {
    fontFamily: "Montserrat",
    fontSize: 15,
    color: "#C38100",
    marginLeft: 5,
  },
  toggleView: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    fontFamily: "Montserrat",
    fontSize: 15,
    color: "#C38100",
    marginLeft: 5,
    marginBottom: 5,
  },
  thumbSlider: {
    height: 15,
    backgroundColor: "#914f49",
    width: 15,
  },
  input: {
    alignSelf: "flex-end",
    margin: 2,
    width: "40%",
  },
  timeButton: {
    alignSelf: "flex-end",
    width: "40%",
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
  },
  line: {
    borderColor: "#C38100",
    borderWidth: 1,
    width: "95%",
    height: 1,
  },
  h2: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    fontSize: 37,
    color: "#C38100",
    zIndex: 1,
    marginTop: -30,
    paddingHorizontal: 10,
    marginBottom: 50,
  },
});

export default NewGame;
