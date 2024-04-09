import React, {useEffect, useState} from 'react';
import {
  Button,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Dimensions,
  FlatList,
  useColorScheme,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../../App';
type LanguageChangeProps = NativeStackScreenProps<
  RootStackParamList,
  'LanguageChange'
>;
const languages_list = [
  {name: 'Afrikaans', code: 'af'},
  {name: 'Albanian - shqip', code: 'sq'},
  {name: 'Amharic - አማርኛ', code: 'am'},
  {name: 'Arabic - العربية', code: 'ar'},
  {name: 'Aragonese - aragonés', code: 'an'},
  {name: 'Armenian - հայերեն', code: 'hy'},
  {name: 'Asturian - asturianu', code: 'ast'},
  {name: 'Azerbaijani - azərbaycan dili', code: 'az'},
  {name: 'Basque - euskara', code: 'eu'},
  {name: 'Belarusian - беларуская', code: 'be'},
  {name: 'Bengali - বাংলা', code: 'bn'},
  {name: 'Bosnian - bosanski', code: 'bs'},
  {name: 'Breton - brezhoneg', code: 'br'},
  {name: 'Bulgarian - български', code: 'bg'},
  {name: 'Catalan - català', code: 'ca'},
  {name: 'Central Kurdish - کوردی (دەستنوسی عەرەبی)', code: 'ckb'},
  {name: 'Chinese - 中文', code: 'zh'},
  {name: 'Chinese (Hong Kong) - 中文（香港）', code: 'zh-HK'},
  {name: 'Chinese (Simplified) - 中文（简体）', code: 'zh-CN'},
  {name: 'Chinese (Traditional) - 中文（繁體）', code: 'zh-TW'},
  {name: 'Corsican', code: 'co'},
  {name: 'Croatian - hrvatski', code: 'hr'},
  {name: 'Czech - čeština', code: 'cs'},
  {name: 'Danish - dansk', code: 'da'},
  {name: 'Dutch - Nederlands', code: 'nl'},
  {name: 'English', code: 'en'},
  {name: 'English (Australia)', code: 'en-AU'},
  {name: 'English (Canada)', code: 'en-CA'},
  {name: 'English (India)', code: 'en-IN'},
  {name: 'English (New Zealand)', code: 'en-NZ'},
  {name: 'English (South Africa)', code: 'en-ZA'},
  {name: 'English (United Kingdom)', code: 'en-GB'},
  {name: 'English (United States)', code: 'en-US'},
  {name: 'Esperanto - esperanto', code: 'eo'},
  {name: 'Estonian - eesti', code: 'et'},
  {name: 'Faroese - føroyskt', code: 'fo'},
  {name: 'Filipino', code: 'fil'},
  {name: 'Finnish - suomi', code: 'fi'},
  {name: 'French - français', code: 'fr'},
  {name: 'French (Canada) - français (Canada)', code: 'fr-CA'},
  {name: 'French (France) - français (France)', code: 'fr-FR'},
  {name: 'French (Switzerland) - français (Suisse)', code: 'fr-CH'},
  {name: 'Galician - galego', code: 'gl'},
  {name: 'Georgian - ქართული', code: 'ka'},
  {name: 'German - Deutsch', code: 'de'},
  {name: 'German (Austria) - Deutsch (Österreich)', code: 'de-AT'},
  {name: 'German (Germany) - Deutsch (Deutschland)', code: 'de-DE'},
  {name: 'German (Liechtenstein) - Deutsch (Liechtenstein)', code: 'de-LI'},
  {name: 'German (Switzerland) - Deutsch (Schweiz)', code: 'de-CH'},
  {name: 'Greek - Ελληνικά', code: 'el'},
  {name: 'Guarani', code: 'gn'},
  {name: 'Gujarati - ગુજરાતી', code: 'gu'},
  {name: 'Hausa', code: 'ha'},
  {name: 'Hawaiian - ʻŌlelo Hawaiʻi', code: 'haw'},
  {name: 'Hebrew - עברית', code: 'he'},
  {name: 'Hindi - हिन्दी', code: 'hi'},
  {name: 'Hungarian - magyar', code: 'hu'},
  {name: 'Icelandic - íslenska', code: 'is'},
  {name: 'Indonesian - Indonesia', code: 'id'},
  {name: 'Interlingua', code: 'ia'},
  {name: 'Irish - Gaeilge', code: 'ga'},
  {name: 'Italian - italiano', code: 'it'},
  {name: 'Italian (Italy) - italiano (Italia)', code: 'it-IT'},
  {name: 'Italian (Switzerland) - italiano (Svizzera)', code: 'it-CH'},
  {name: 'Japanese - 日本語', code: 'ja'},
  {name: 'Kannada - ಕನ್ನಡ', code: 'kn'},
  {name: 'Kazakh - қазақ тілі', code: 'kk'},
  {name: 'Khmer - ខ្មែរ', code: 'km'},
  {name: 'Korean - 한국어', code: 'ko'},
  {name: 'Kurdish - Kurdî', code: 'ku'},
  {name: 'Kyrgyz - кыргызча', code: 'ky'},
  {name: 'Lao - ລາວ', code: 'lo'},
  {name: 'Latin', code: 'la'},
  {name: 'Latvian - latviešu', code: 'lv'},
  {name: 'Lingala - lingála', code: 'ln'},
  {name: 'Lithuanian - lietuvių', code: 'lt'},
  {name: 'Macedonian - македонски', code: 'mk'},
  {name: 'Malay - Bahasa Melayu', code: 'ms'},
  {name: 'Malayalam - മലയാളം', code: 'ml'},
  {name: 'Maltese - Malti', code: 'mt'},
  {name: 'Marathi - मराठी', code: 'mr'},
  {name: 'Mongolian - монгол', code: 'mn'},
  {name: 'Nepali - नेपाली', code: 'ne'},
  {name: 'Norwegian - norsk', code: 'no'},
  {name: 'Norwegian Bokmål - norsk bokmål', code: 'nb'},
  {name: 'Norwegian Nynorsk - nynorsk', code: 'nn'},
  {name: 'Occitan', code: 'oc'},
  {name: 'Oriya - ଓଡ଼ିଆ', code: 'or'},
  {name: 'Oromo - Oromoo', code: 'om'},
  {name: 'Pashto - پښتو', code: 'ps'},
  {name: 'Persian - فارسی', code: 'fa'},
  {name: 'Polish - polski', code: 'pl'},
  {name: 'Portuguese - português', code: 'pt'},
  {name: 'Portuguese (Brazil) - português (Brasil)', code: 'pt-BR'},
  {name: 'Portuguese (Portugal) - português (Portugal)', code: 'pt-PT'},
  {name: 'Punjabi - ਪੰਜਾਬੀ', code: 'pa'},
  {name: 'Quechua', code: 'qu'},
  {name: 'Romanian - română', code: 'ro'},
  {name: 'Romanian (Moldova) - română (Moldova)', code: 'mo'},
  {name: 'Romansh - rumantsch', code: 'rm'},
  {name: 'Russian - русский', code: 'ru'},
  {name: 'Scottish Gaelic', code: 'gd'},
  {name: 'Serbian - српски', code: 'sr'},
  {name: 'Serbo - Croatian', code: 'sh'},
  {name: 'Shona - chiShona', code: 'sn'},
  {name: 'Sindhi', code: 'sd'},
  {name: 'Sinhala - සිංහල', code: 'si'},
  {name: 'Slovak - slovenčina', code: 'sk'},
  {name: 'Slovenian - slovenščina', code: 'sl'},
  {name: 'Somali - Soomaali', code: 'so'},
  {name: 'Southern Sotho', code: 'st'},
  {name: 'Spanish - español', code: 'es'},
  {name: 'Spanish (Argentina) - español (Argentina)', code: 'es-AR'},
  {name: 'Spanish (Latin America) - español (Latinoamérica)', code: 'es-419'},
  {name: 'Spanish (Mexico) - español (México)', code: 'es-MX'},
  {name: 'Spanish (Spain) - español (España)', code: 'es-ES'},
  {name: 'Spanish (United States) - español (Estados Unidos)', code: 'es-US'},
  {name: 'Sundanese', code: 'su'},
  {name: 'Swahili - Kiswahili', code: 'sw'},
  {name: 'Swedish - svenska', code: 'sv'},
  {name: 'Tajik - тоҷикӣ', code: 'tg'},
  {name: 'Tamil - தமிழ்', code: 'ta'},
  {name: 'Tatar', code: 'tt'},
  {name: 'Telugu - తెలుగు', code: 'te'},
  {name: 'Thai - ไทย', code: 'th'},
  {name: 'Tigrinya - ትግርኛ', code: 'ti'},
  {name: 'Tongan - lea fakatonga', code: 'to'},
  {name: 'Turkish - Türkçe', code: 'tr'},
  {name: 'Turkmen', code: 'tk'},
  {name: 'Twi', code: 'tw'},
  {name: 'Ukrainian - українська', code: 'uk'},
  {name: 'Urdu - اردو', code: 'ur'},
  {name: 'Uyghur', code: 'ug'},
  {name: 'Uzbek - o‘zbek', code: 'uz'},
  {name: 'Vietnamese - Tiếng Việt', code: 'vi'},
  {name: 'Walloon - wa', code: 'wa'},
  {name: 'Welsh - Cymraeg', code: 'cy'},
  {name: 'Western Frisian', code: 'fy'},
  {name: 'Xhosa', code: 'xh'},
  {name: 'Yiddish', code: 'yi'},
  {name: 'Yoruba - Èdè Yorùbá', code: 'yo'},
  {name: 'Zulu - isiZulu', code: 'zu'},
];
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
const LanguageChange = ({navigation, route}: LanguageChangeProps) => {
  const [language, setLanguage] = useState<string>('');
  const light = useColorScheme() === 'light';
  const updateLanguage = async () => {
    Alert.alert('Please wait...');
    const user = auth().currentUser;
    if (user) {
      const authUserId = user.uid;
      try {
        await database()
          .ref(`Users/${authUserId}/`)
          .update({language: language})
          .then(() => {
            Alert.alert('Language updated...');
            navigation.pop();
          });
      } catch {
        Alert.alert('Error... please try again..');
      }
    }
  };

  return (
    <View style={light ? styles.LanguageLight : styles.LanguageDark}>
      <StatusBar
        backgroundColor={light ? '#FFFFFF' : '#000000'}
        barStyle={light ? 'dark-content' : 'light-content'}
      />
      <Text style={light ? styles.HeadingLight : styles.HeadingDark}>
        Language
      </Text>
      <Text style={styles.Discription}>Select your preferred</Text>
      <Text style={styles.Discription}>language to communicate</Text>

      <View style={styles.CenterContainer}></View>
      <FlatList
        data={languages_list}
        keyExtractor={item => item.code.toString()}
        numColumns={2}
        renderItem={({item}) => {
          return (
            <View style={styles.CenterContainer}>
              <View style={styles.languageSelectionView}>
                <TouchableOpacity
                  onPress={() => {
                    setLanguage(item.name);
                  }}
                  style={
                    language === item.name
                      ? styles.SelectedLanguageButton
                      : light
                      ? styles.LanguageButtonLight
                      : styles.LanguageButtonDark
                  }>
                  <Text
                    style={
                      language === item.name
                        ? {
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            margin: 10,
                          }
                        : {
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#000000',
                            margin: 10,
                          }
                    }>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity onPress={updateLanguage} style={styles.UpdateButton}>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFFFFF'}}>
          Update
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  LanguageLight: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  LanguageDark: {
    backgroundColor: '#000000',
    flex: 1,
  },

  HeadingLight: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#000000',
    marginStart: 10,
    marginTop: 30,
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  HeadingDark: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginStart: 10,
    marginTop: 30,
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  Discription: {
    color: '#B0B0B0',
    fontWeight: 'bold',
    fontSize: 22,
    marginStart: 10,
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  CenterContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 50,
  },
  languageSelectionView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },

  LanguageButtonLight: {
    borderRadius: 30,
    backgroundColor: '#D9D9D9',
    height: 45,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  LanguageButtonDark: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    height: 45,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  SelectedLanguageButton: {
    borderRadius: 30,
    backgroundColor: '#429BEE',
    height: 45,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  LanguageLogo: {
    height: 300,
    width: Dimensions.get('screen').width,
  },
  TextInput: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    height: 40,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
    width: 300,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderColor: '#B0B0B0',
    shadowColor: '#000000',
    shadowOpacity: 10,
    textAlign: 'left',
    color: '#000000',
  },
  UpdateButton: {
    alignSelf: 'center',
    margin: 10,
    borderRadius: 30,
    backgroundColor: '#429BEE',
    height: 45,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
    marginVertical: 30,
  },
  SubOption: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  SignInOption: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  OptionLogo: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  AlreadyHavingAccount: {
    flexDirection: 'row',
    marginTop: 30,
  },
  AlreadyHavingAccountText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    marginHorizontal: 2,
  },
  AlreadyHavingAccountSignInText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0094FF',
    marginHorizontal: 2,
    marginBottom: 20,
  },
});

export default LanguageChange;
