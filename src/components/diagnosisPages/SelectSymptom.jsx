import { Text, TextInput, View, FlatList, StyleSheet } from "react-native";
import { useState } from "react";

import CustomButton from "../CustomButton";

const SelectSymptom = (props) => {
  console.log(props.symptomList.length);

  const [searchFieldValue, setSearchFieldValue] = useState("");
  const [originalSymptomList] = useState(props.symptomList);
  const [symptomList, setSymptionList] = useState(originalSymptomList);
  const isFirstDiagnosisScreen = props.diagnosisData.screenIndex === 0;

  const searchFieldHandler = (text) => {
    setSearchFieldValue(text); // Update the search field value
    const filteredSymptomList = originalSymptomList.filter((symptom) => {
      return symptom.name.includes(text); // Use the 'text' parameter directly here
    });
    setSymptionList(filteredSymptomList); // Update the displayed list
  };

  return (
    <>
      <Text style={s.headerText}>
        {isFirstDiagnosisScreen
          ? "มาประเมินโรคกัน"
          : "มีอาการเพิ่มเติมหรือไม่?"}
      </Text>
      <Text style={s.headerDescriptionText}>
        {"เริ่มจากการเลือกอาการที่กระทบที่สุด"}
      </Text>
      <TextInput
        placeholder="ค้นหาอาการที่ต้องการ..."
        style={s.searchField}
        value={searchFieldValue}
        onChangeText={searchFieldHandler} // Call the handler with each change
      />
      {isFirstDiagnosisScreen === 0 && (
        <View style={s.symptomListItem__notFound}>
          <Text style={s.symptomListItem__notFoundText}>
            ไม่พบอาการที่คุณค้นหา ⛓️‍💥
          </Text>
        </View>
      )}
      <FlatList
        data={symptomList}
        keyExtractor={(symptom) => symptom.id}
        style={s.symptomList}
        renderItem={({ item: symptom, index }) => {
          return (
            <View
              style={[
                s.symptomListItem,
                index === symptomList.length - 1 && { marginBottom: 100 },
              ]}
            >
              <Text style={s.symptomListItem__titleText}>{symptom.name}</Text>
              <Text style={s.symptomListItem__descriptionText}>
                {symptom.description}
              </Text>
              <CustomButton
                onPress={() => props.selectedSymptomHandler(symptom)}
                style={s.symptomListItem__button}
                pressedStyle={s.homeListItem__buttonPressed}
              >
                <Text style={s.symptomListItem__buttonText}>{">"}</Text>
              </CustomButton>
            </View>
          );
        }}
      />
    </>
  );
};

const s = StyleSheet.create({
  headerText: {
    fontSize: 40,
    fontFamily: "SemiBold",
  },
  headerDescriptionText: {
    fontSize: 15,
    fontFamily: "SemiBold",
    marginBottom: 10,
  },
  symptomList: {
    borderRadius: 20,
  },
  symptomListItem: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    overflow: "visible",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  symptomListItem__notFound: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  symptomListItem__notFoundText: {
    textAlign: "center",
    fontFamily: "SemiBold",
  },
  symptomListItem__titleText: {
    fontSize: 20,
    fontFamily: "SemiBold",
    flex: 1,
  },
  symptomListItem__descriptionText: {
    flex: 1,
    fontFamily: "SemiBold",
  },
  symptomListItem__button: {
    flex: 0.3,
    backgroundColor: "#3246FF",
    paddingVertical: 30,
    borderRadius: 100,
    justifyContent: "center",
  },
  symptomListItem__buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: 800,
  },
  searchField: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
    marginBottom: 20,
    fontFamily: "SemiBold",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  homeListItem__button: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: "#3246FF",
    width: "40%",
    height: 40,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  homeListItem__buttonText: {
    color: "#fff",
    fontFamily: "SemiBold",
  },
  homeListItem__buttonPressed: {
    backgroundColor: "#2533b3",
    elevation: 1,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.25,
  },
});

export default SelectSymptom;
