import { useState } from "react";
import { View, Text, StyleSheet, Alert, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import CustomButton from "../components/CustomButton";
import RootContainer from "../components/RootContainer";
import SelectSymptom from "../components/diagnosisPages/SelectSymptom";
import SelectOptions from "../components/diagnosisPages/SelectOptions";
import Conclusions from "./Conclusions";
import LottieView from "lottie-react-native";
import { ErrorBoundary } from "react-error-boundary";
import { conclusionActions } from "../context/conclusionSlice";
import { authenticationActions } from "../context/authenticationSlice";
import { writeConclusionHistory } from "../context/conclusionSlice";
import { Fonts } from "../constants/styles";

import {
  diagnosisDataType,
  diagnosisOption,
  screenType,
  symptom,
  symptomLength,
} from "../models/diagnosisTypes";
import { StackNavigation } from "../../App";
import { create } from "react-test-renderer";
import { RootState } from "../context/store";

let diagnosisData: diagnosisDataType = {
  screenIndex: 0,
  screenType: ["selectSymptom"],
  options: [],
  optionsSettings: { checklist: false, header: "", subheader: "" },
  symptomList: [],
  selectedOptionList: [],
};

const symptomLengthList: symptomLength[] = [
  {
    value: "2-3",
    name: "2-3 วัน",
  },
  {
    value: "7",
    name: "1 สัปดาห์",
  },
];

const logDiagnosisData = () => {
  console.log(
    `
    --------------------------
    screenIndex: ${diagnosisData.screenIndex},
    screenType: ${diagnosisData.screenType},
    options: ${JSON.stringify(diagnosisData.options)},
    optionsSettings: ${JSON.stringify(diagnosisData.optionsSettings)},
    symptomList: ${JSON.stringify(diagnosisData.symptomList)},
    selectedOptionList: ${JSON.stringify(diagnosisData.selectedOptionList)}
    --------------------------
    `
  );
};

const Diagnosis = (props) => {
  const navigation = useNavigation<StackNavigation>();
  const symptomList = [
    {
      id: "heavy_diarrhea",
      name: "ท้องเสียหนัก",
      emoji: "💩",
      description:
        "การถ่ายอุจจาระเหลว หรือถ่ายเป็นน้ำ 4-5 ครั้งขึ้นไปภายใน 24ชม",
    },
    {
      id: "fever",
      name: "ไข้",
      emoji: "🤒",
      description:
        "ภาวะที่อุณหภูมิของร่างกายสูงกว่าปกติ บ่งบอกถึงการติดเชื้อหรืออาการอื่นๆ",
    },
  ];
  const [conclusionsVisible, setConclusionsVisible] = useState<boolean>(false);
  const [conclusion, setConclusion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const screenIndex: number = diagnosisData.screenIndex;
  const screenType: screenType = diagnosisData.screenType[screenIndex];
  const userUid = useSelector<RootState>((state) => state.authentication.uid);
  const userInfo = useSelector<any>(
    (state) => state.authentication.userInformation
  );
  const dispatch = useDispatch<any>();

  logDiagnosisData();

  const nextScreen = (nextScreenType: screenType) => {
    diagnosisData.screenType.push(nextScreenType);
    diagnosisData.screenIndex++;

    props.navigation.push("diagnosis");
  };

  const addSymptom = (symptom: symptom, nextScreenType: screenType) => {
    diagnosisData.symptomList.push(symptom);
    nextScreen(nextScreenType);
  };

  // const addSymptomLength = (length: symptomLength, nextScreenType: screenType) => {
  //   diagnosisData["symptomList"][screenIndex - 1]["length"] = length;
  //   nextScreen(nextScreenType);
  // };

  const resetDiagnosisData = () => {
    diagnosisData = {
      screenIndex: 0,
      screenType: ["selectSymptom"],
      options: [],
      optionsSettings: { checklist: false, header: "", subheader: "" },
      symptomList: [],
      selectedOptionList: [],
    };
  };

  const jumpToConclusions = (conclusionId: string) => {
    dispatch(
      conclusionActions.setDisplayConclusion({
        diseaseId: conclusionId,
        diagnosisData: diagnosisData,
      })
    );
    if (conclusionId !== "no_match") {
      dispatch(writeConclusionHistory(userUid));
    }

    resetDiagnosisData();
    setLoading(true);
    setTimeout(() => {
      resetDiagnosisData();

      navigation.navigate("conclusions");
      setLoading(false);
    }, 2000);
  };

  const rewindSymptom = () => {
    if (screenIndex === 0) {
      Alert.alert(
        "คุณแน่ใจแล้วใช่ไหมว่าจะเลิกการประเมินครั้งนี้",
        "ถ้าคุณยกเลิกการประเมินครั้งนี้ ข้อมูลที่คุณกรอกไปจะถูกลบทิ้ง",
        [
          {
            text: "ยกเลิก",
            onPress: () => {
              navigation.goBack();
              resetDiagnosisData();
            },
          },
          {
            text: "ประเมินต่อ",
            style: "cancel",
          },
        ]
      );

      return;
    }

    const lastScreenType =
      diagnosisData["screenType"][diagnosisData.screenIndex - 1];

    console.log(lastScreenType);

    // Determine which screen type and remove previous information added
    switch (lastScreenType) {
      case "selectSymptom":
        diagnosisData.symptomList.splice(-1);
      case "symptomLength":
        delete diagnosisData.symptomList[diagnosisData.symptomList.length - 1];
      case "customOptions":
        diagnosisData.selectedOptionList.pop();
      // NOT SPLICING SCREENTYPE
    }
    logDiagnosisData();

    diagnosisData.screenType.splice(-1);
    diagnosisData.screenIndex--;
    navigation.goBack();
  };

  const createCustomOptions = ({
    header,
    subheader,
    options,
    nextDiagnosisPage,
    checklist = false,
  }) => {
    diagnosisData.options = options;
    options.at(-1).question = header;
    diagnosisData.optionsSettings = {
      checklist,
      header,
      subheader,
    };

    if (nextDiagnosisPage) nextScreen("customOptions");
  };

  const yesNoOptions = [
    { name: "ใช่", value: "yes" },
    { name: "ไม่", value: "no" },
  ];

  const createYesNoOptions = (
    header: string,
    nextDiagnosisPage: boolean,
    subheader = ""
  ) => {
    createCustomOptions({
      header,
      subheader,
      options: yesNoOptions,
      nextDiagnosisPage,
    });
  };

  const handleSelectSymtomPress = (symptom) => {
    const id = symptom.id;
    const symptomList = diagnosisData.symptomList;

    switch (id) {
      case "heavy_diarrhea":
        addSymptom(symptom, "customOptions");
        createYesNoOptions("คุณน้ำหนักลดลงอย่างรวดเร็วหรือเปล่า?", false);
        break;
      case "fever":
        if (screenIndex === 0) {
          addSymptom(symptom, "customOptions");
          createCustomOptions({
            header: "จาก 3 อาการดังกล่าว มีอาการไหนตรงกับคุณไหม",
            subheader: "เลือกได้หลายอาการ ถ้าไม่มีอาการไหนตรงให้กดไปต่อ",
            checklist: true,
            options: [
              { name: "ไม่รู้สึกตัว", value: "ไม่รู้สึกตัว" },
              { name: "ปวดศรีษะมาก", value: "ปวดศรีษะมาก" },
              {
                name: "อาเจียนหนักหรือชัก",
                value: "อาเจียนหนักหรือชัก",
              },
            ],
            nextDiagnosisPage: false,
          });
          return;
        } else if (
          symptomList[0]["id"] === "heavy_diarrhea" &&
          symptom.id === "fever"
        ) {
          addSymptom(symptom, "customOptions");
          createYesNoOptions(
            "ในช่วงหลายเดือนที่ผ่านมา คุณเคยเข้าป่าที่มียุงเยอะหรือไม่",
            false
          );
        }
        break;
      case "no_match":
        if (
          symptomList[0]["id"] === "heavy_diarrhea" &&
          symptom.id === "no_match"
        ) {
          addSymptom(symptom, "customOptions");
          createYesNoOptions(
            "คุณกินยาถ่าย ยาลดกรด ยารักษาโรคเกาต์ มะขามแขกเป็นประจำหรือไม่",
            false
          );
        }
    }
  };

  // const handleSymptomLengthPress = (symptomLength) => {
  //   addSymptomLength(symptomLength.value, "selectSymptom");
  // };

  const handleCustomOptionPress = (
    option: diagnosisOption,
    headerText: string
  ) => {
    option.question = headerText;
    diagnosisData.selectedOptionList.push(option);

    const latestSelectedSymptom = diagnosisData.symptomList.at(-1);
    const latest = diagnosisData.selectedOptionList.at(-1);

    if (!latestSelectedSymptom || !latest) {
      console.error("No symptoms or options available");
      return;
    }

    switch (latestSelectedSymptom.id) {
      //////////////////////// HEAVY DIARRHEA q&as ////////////////////////
      case "heavy_diarrhea":
        if (latest.question === "คุณน้ำหนักลดลงอย่างรวดเร็วหรือเปล่า?") {
          if (latest.value === "yes") {
            createCustomOptions({
              header: "จากอาการดังกล่าว มีอาการไหนตรงกับคุณไหม",
              subheader: "เลือกได้หลายอาการ ถ้าไม่มีอาการไหนตรงให้กดไปต่อ",
              checklist: true,
              options: [
                { name: "เหนื่อยง่าย", value: "เหนื่อยง่าย" },
                { name: "มือสั่น", value: "มือสั่น" },
                { name: "คอพอก", value: "คอพอก" },
                { name: "ตาโพน", value: "ตาโพน" },
                {
                  name: "หัวใจเต้นเร็วกว่าปกติ",
                  value: "หัวใจเต้นเร็วกว่าปกติ",
                },
              ],
              nextDiagnosisPage: true,
            });
          } else if (latest.value === "no") {
            nextScreen("selectSymptom");
          }
        }
        if (latest.question === "จากอาการดังกล่าว มีอาการไหนตรงกับคุณไหม") {
          const optionsChecked = parseInt(latest.value);

          if (optionsChecked >= 2) {
            jumpToConclusions("thyroid");
          } else {
            createYesNoOptions("คุณกระหายน้ำและปัสสาวะบ่อยขึ้นหรือไม่", true);
          }
        }
        break;

      //////////////////////// FEVER q&as ////////////////////////
      case "fever":
        if (latest.question === "จาก 3 อาการดังกล่าว มีอาการไหนตรงกับคุณไหม") {
          const optionsChecked = parseInt(latest.value);

          if (optionsChecked === 3) {
            const birthDate = new Date(userInfo.birthday);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            if (age >= 18) {
              createCustomOptions({
                header: "คุณได้เข้าป่าในช่วงที่ผ่านมาหรือไม่",
                subheader: `เราใช้ข้อมูลอายุคุณเพื่อประเมิน จากระบบคุณอายุ ${age} ปี`,
                options: yesNoOptions,
                nextDiagnosisPage: true,
              });
            } else {
            }
          } else {
            createYesNoOptions(
              "คุณมีอาการของภาวะช็อกหรือไม่",
              true,
              "เหงื่อออก ตัวเย็นกระสับการะส่าย ชีพจรเบาเร็วและความดันเลือดตก เป็นอาการหลักๆของภาวะช็อค"
            );
          }
        }
        if (
          latest.question ===
          "ในช่วงหลายเดือนที่ผ่านมา คุณเคยเข้าป่าที่มียุงเยอะหรือไม่"
        ) {
          if (latest.value === "yes") {
            jumpToConclusions("malaria");
          } else if (latest.value === "no") {
            createYesNoOptions("คุณไข้สูงตลอดเวลา และ ม้ามโตหรือไม่", true);
          }
        }
        if (latest.question === "คุณไข้สูงตลอดเวลา และ ม้ามโตหรือไม่") {
          if (latest.value === "yes") {
            jumpToConclusions("typhoid");
          } else if (latest.value === "no") {
            jumpToConclusions("no_match");
          }
        }
        if (latest.question === "คุณได้เข้าป่าในช่วงที่ผ่านมาหรือไม่") {
          if (latest.value === "yes") {
            jumpToConclusions("malaria");
          } else {
            createCustomOptions({
              header: "จากอาการดังกล่าว มีอาการไหนตรงกับคุณไหม",
              subheader: "เลือกได้หลายอาการ",
              checklist: true,
              options: [
                {
                  name: "เคยถูกสุนัขหรือสัตว์เลี้ยงลูกด้วนนมกัดหรือข่วน",
                  value: "เคยถูกสุนัขหรือสัตว์เลี้ยงลูกด้วนนมกัดหรือข่วน",
                },
                { name: "กลัวน้ำ", value: "กลัวน้ำ" },
              ],
              nextDiagnosisPage: true,
            });
          }
        }
        if (latest.question === "คุณมีอาการของภาวะช็อกหรือไม่") {
          if (latest.value === "yes") {
            jumpToConclusions("no_match");
          } else {
            createYesNoOptions("คุณอาการไข้เกินหนึ่งเดือนหรือไม่", true);
          }
        }
        if (latest.question === "จากอาการดังกล่าว มีอาการไหนตรงกับคุณไหม") {
          const optionsChecked = parseInt(latest.value);
          if (optionsChecked === 2) {
            jumpToConclusions("tetanus");
          } else {
            createYesNoOptions("คุณรู้สึกตัวดีหรือไม่", true);
          }
        }
        if (latest.question === "คุณอาการไข้เกินหนึ่งเดือนหรือไม่") {
          if (latest.value === "yes") {
            createYesNoOptions("คุณไอและน้ำหนักลดอย่างรวดเร็วหรือไม่", true);
          } else {
          }
        }
        break;

      //////////////////////// NO MATCH q&as ////////////////////////
      case "no_match":
        if (
          latest.question ===
          "คุณกินยาถ่าย ยาลดกรด ยารักษาโรคเกาต์ มะขามแขกเป็นประจำหรือไม่"
        ) {
          console.log("here");
          if (latest.value === "no") {
            createYesNoOptions("คุณท้องผูกสลับกับท้องเสียหรือไม่?", true);
          } else if (latest.value === "yes") {
            jumpToConclusions("irritable_bowel");
          }
        }
        if (latest.question === "คุณท้องผูกสลับกับท้องเสียหรือไม่?") {
          if (latest.value === "yes") {
            createYesNoOptions("คุณเคยเป็นโรคลำไส้แปรปรวนหรือไม่", true);
          } else if (latest.value === "no") {
            createYesNoOptions("คุณเคยมีอาการทวารหนักโผล่ในเด็กหรือไม่", true);
          }
        }
        if (latest.question === "คุณเคยเป็นโรคลำไส้แปรปรวนหรือไม่") {
          if (latest.value === "yes") {
            jumpToConclusions("irritable_bowel");
          } else if (latest.value === "no") {
            createYesNoOptions("คุณเคยมีอาการทวารหนักโผล่ในเด็กหรือไม่", true);
          }
        }
        if (latest.question === "คุณเคยมีอาการทวารหนักโผล่ในเด็กหรือไม่") {
          if (latest.value === "yes") {
            jumpToConclusions("tricuriasis");
          } else if (latest.value === "no") {
            createYesNoOptions("มีอาการเฉพาะหลังดื่มนมหรือไม่?", true);
          }
        }
        if (latest.question === "มีอาการเฉพาะหลังดื่มนมหรือไม่?") {
          if (latest.value === "yes") {
            jumpToConclusions("lactase_deficiency");
          } else if (latest.value === "no") {
            createYesNoOptions("คุณสุขภาพร่างกายแข็งแรงดีหรือไม่", true);
          }
        }
        if (latest.question === "คุณสุขภาพร่างกายแข็งแรงดีหรือไม่") {
          if (latest.value === "yes") {
            createYesNoOptions("คุณมีอาการมามากกว่า 2 อาทิตย์หรือไม่", true);
          } else if (latest.value === "no") {
            createYesNoOptions("คุณเคยเป็น บาวหวานมาก่อนหรือไม่", true);
          }
        }
        if (latest.question === "คุณมีอาการมามากกว่า 2 อาทิตย์หรือไม่") {
          if (latest.value === "yes") {
            jumpToConclusions("irritable_bowel");
          } else if (latest.value === "no") {
            createYesNoOptions(
              "เกิดอาการเมื่อหลังกินอาหารประมาณ 30 นาทีหรือไม่",
              true
            );
          }
        }
        if (
          latest.question === "เกิดอาการเมื่อหลังกินอาหารประมาณ 30 นาทีหรือไม่"
        ) {
          if (latest.value === "yes") {
            createYesNoOptions("คุณเคยเป็น บาวหวานมาก่อนหรือไม่", true);
          } else {
            jumpToConclusions("no_match");
          }
        }
        if (latest.question === "คุณเคยเป็น บาวหวานมาก่อนหรือไม่") {
          if (latest.value === "yes") {
            jumpToConclusions("diabetes");
          } else {
            jumpToConclusions("no_match");
          }
        }
        break;
    }

    // if (latest.question === "จากอาการดังกล่าว มีอาการไหนตรงกับคุณไหม") {
    //   if (latest.value === "no") {
    //     createYesNoOptions("คุณกระหายน้ำและปัสสาวะบ่อยขึ้นหรือไม่", true);
    //   }
    // }

    if (latest.question === "คุณกระหายน้ำและปัสสาวะบ่อยขึ้นหรือไม่") {
      if (latest.value === "yes") {
        createYesNoOptions(
          "ช่วงหลังคุณถ่ายเหลว,มีกลิ่นเหม็นมากหรือมีเลือดในอุจาระหรือไม่",
          true
        );
      } else {
        jumpToConclusions("no_match");
      }
    }
    if (
      latest.question ===
      "ช่วงหลังคุณถ่ายเหลว,มีกลิ่นเหม็นมากหรือมีเลือดในอุจาระหรือไม่"
    ) {
      if (latest.value === "yes") {
        jumpToConclusions("giardia");
      }
    }
  };

  const handleChecklistCompletion = (completeCheckList, headerText: string) => {
    let numberOfOptionsChecked = 0;
    completeCheckList.forEach((option) => {
      option.isChecked && numberOfOptionsChecked++;
    });

    handleCustomOptionPress(
      {
        name: numberOfOptionsChecked.toString(),
        value: numberOfOptionsChecked.toString(),
        question: headerText,
      },
      headerText
    );

    // if (numberOfOptionsChecked >= 2) {
    //   handleCustomOptionPress(
    //     { name: "2 ขึ้นไป", value: ">= 2", question: headerText },
    //     headerText
    //   );
    // } else {
    //   handleCustomOptionPress(
    //     { name: "น้อยกว่า 2", value: "< 2", question: headerText },
    //     headerText
    //   );
    // }
  };

  const displayScreenType = (type) => {
    if (loading)
      return (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <LottieView
            source={require("../../assets/animations/findingAnimation.json")}
            style={{ width: 400, height: 400 }}
            autoPlay
          />
          {/* <Animated.Text
              style={[
              s.loadingText,
              {
                color: "#fff",
                opacity: 1,
                transform: [
                {
                  scale: 2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                  }),
                },
                ],
              },
              ]}
            >
              กำลังประเมิน
            </Animated.Text> */}
        </View>
      );

    switch (type) {
      case "selectSymptom":
        return (
          <SelectSymptom
            symptomList={symptomList}
            selectedSymptomHandler={handleSelectSymtomPress}
            diagnosisData={diagnosisData}
          />
        );
      // case "symptomLength":
      //   return (
      //     <SelectOptions
      //       headerText={`คุ��มีอา��าร${
      //         symptomList.find(
      //           (symptom) =>
      //             symptom["id"] === diagnosisData.symptomList.slice(-1)[0]["id"]
      //         ).name
      //       }มานานแค่ไหนแล้ว?`}
      //       optionsList={symptomLengthList}
      //       onOptionPress={handleSymptomLengthPress}
      //     />
      //   );
      case "customOptions":
        return (
          <SelectOptions
            optionsList={diagnosisData.options}
            optionsSettings={diagnosisData.optionsSettings}
            onOptionPress={handleCustomOptionPress}
            onChecklistCompletion={handleChecklistCompletion}
          />
        );
      default:
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <>
          <Text>404</Text>
        </>
      }
    >
      <RootContainer>
        <Modal
          visible={conclusionsVisible}
          presentationStyle="pageSheet"
          animationType="slide"
        >
          <Conclusions conclusionId={conclusion} />
        </Modal>
        {displayScreenType(screenType)}
        {!loading && (
          <CustomButton style={s.backButton} onPress={rewindSymptom}>
            <Text style={{ fontFamily: Fonts.regular }}>กลับ</Text>
          </CustomButton>
        )}
      </RootContainer>
    </ErrorBoundary>
  );
};

const s = StyleSheet.create({
  headerText: {
    fontSize: 40,
    fontFamily: Fonts.regular,
  },
  headerDescriptionText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    marginBottom: 10,
  },

  backButton: {
    position: "absolute",
    bottom: 30,
    left: 30,
    backgroundColor: "#fdfdfd",
    padding: 20,
    borderRadius: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.25,
  },
  loadingText: {
    fontFamily: Fonts.regular,
  },
});

export default Diagnosis;
