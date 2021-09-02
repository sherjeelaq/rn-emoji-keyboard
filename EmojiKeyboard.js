import React, {
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react'
import { emojiList } from './EmojiList'
import { Col, Icon, Row } from 'components'
import {
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import styled from 'styled-components'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { RFValue as rf } from 'react-native-responsive-fontsize'
import { theme } from 'lib'
import DeviceInfo from 'react-native-device-info'
import { isNewIphone } from 'core'

const SearchInput = styled(TextInput)`
  background-color: #13100e;
  height: ${hp(5.6)}px;
  color: #888786;
  padding: 0 12px;
  width: ${wp(88)}px;
  border-top-left-radius: ${wp(4)}px;
  font-size: ${rf(12)}px;
`

const Emoji = styled(Text)`
  padding: ${props =>
    props.isCategory
      ? `0 ${wp(2.4)}px`
      : `${hp(1.2)}px ${wp(1.2)}px`};
  font-size: ${props =>
    props.platform === 'android' ? `${rf(25)}px` : `${rf(26)}px`};
`

let timeout
function EmojiKeyboard({ onChange, show }) {
  const emojiListRef = useRef()

  const [sortedEmojiList, setSortedEmojiList] = useState()
  const [categories, setCategories] = useState([])
  const [sections, setSections] = useState([])
  const [activeMenu, setActiveMenu] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState('')
  const [loading, setLoading] = useState(false)
  const [keyboardOpened, setKeyboardOpened] = useState(false)

  const androidUnicodeSupport = {
    4: '6.0',
    4.1: '6.0',
    4.3: '6.2',
    4.4: '6.2',
    5: '6.3',
    6: '7.0',
    7: '8.0',
    7.1: '8.0',
    8: '9.0',
    8.1: '9.0',
    9: '10.0',
    10: '11.0',
    11: '13.0',
    12: '13.0'
  }
  useEffect(() => {
    let tempEmoji = []

    if (Platform.OS === 'android') {
      let deviceVersion = parseInt(DeviceInfo.getSystemVersion())
      let unicodeSupport = parseFloat(
        androidUnicodeSupport[deviceVersion]
          ? androidUnicodeSupport[deviceVersion]
          : '7.0'
      )
      tempEmoji = emojiList.filter(
        emoji => parseFloat(emoji.unicode_version) <= unicodeSupport
      )
    } else if (Platform.OS === 'ios') {
      let deviceVersion = parseFloat(DeviceInfo.getSystemVersion())

      tempEmoji = emojiList.filter(
        emoji => parseFloat(emoji.ios_version) <= deviceVersion
      )
    }
    setSortedEmojiList(tempEmoji)
  }, [])

  useEffect(() => {
    let tempCategories = []
    let tempSections = []

    if (sortedEmojiList && sortedEmojiList.length > 0) {
      let temp = sortedEmojiList?.filter(emoji => {
        if (!tempCategories.includes(emoji.category)) {
          tempCategories.push(emoji.category)
          return emoji.category
        }
      })

      tempCategories.map((cat, i) => {
        tempSections.push({
          title: cat,
          symbol: temp[i].emoji,
          data: sortedEmojiList?.filter(el => el.category === cat)
        })
      })

      setCategories(temp)
      setSections(tempSections)
    }
  }, [sortedEmojiList])

  useEffect(() => {
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    const handleSearch = () => {
      setLoading(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        let regex = new RegExp(`^${escapeRegExp(searchText)}`, 'gi')

        let tempRes = sortedEmojiList?.filter(emoji => {
          if (
            regex.test(emoji.description) ||
            emoji.tags.some(tag => regex.test(tag)) ||
            emoji.aliases.some(alias => regex.test(alias))
          ) {
            return emoji
          }
        })

        setSearchResults(tempRes)
        setLoading(false)
      }, 200)
    }
    handleSearch()
  }, [searchText])

  const changeCategory = index => {
    emojiListRef?.current?.scrollToIndex({
      index: 0,
      animated: false
    })
    setActiveMenu(index)
  }

  const clearSearchInput = () => {
    setSearchText('')
    setSearchResults([])
  }

  const renderEmoji = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => {
          onChange({
            type: 'add',
            emoji: item.emoji
          })
        }}
      >
        <Emoji platform={Platform.OS}>{item.emoji}</Emoji>
      </TouchableOpacity>
    ),
    [onChange]
  )

  const renderEmojiCategory = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => changeCategory(index)}
      style={{
        borderBottomColor: index === activeMenu && theme.BLUE,
        borderBottomWidth: index === activeMenu ? 4 : 0,
        height: hp(6.3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Emoji
        platform={Platform.OS}
        active={index === activeMenu}
        isCategory
      >
        {item.emoji}
      </Emoji>
    </TouchableOpacity>
  )

  const renderEmojiKey = useCallback(item => item.description, [])
  const renderEmojiCatKey = useCallback(item => item.category, [])

  return (
    <React.Fragment>
      {show ? (
        <KeyboardAvoidingView
          style={{
            flex: 1,
            minHeight: keyboardOpened ? hp(18) : 'auto'
          }}
        >
          <Col marg={isNewIphone() ? '0 0 15px 0' : '0'}>
            <Row noFlex>
              <Row noFlex relative>
                <SearchInput
                  placeholder='Search'
                  placeholderTextColor='#888786'
                  value={searchText}
                  onChangeText={text => setSearchText(text)}
                  autoCapitalize='none'
                  autoCorrect={false}
                  onFocus={() => {
                    setKeyboardOpened(true)
                  }}
                  onBlur={() => {
                    setKeyboardOpened(false)
                  }}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => clearSearchInput()}
                    style={{
                      position: 'absolute',
                      right: wp(4),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: hp(5.6),
                      paddingTop: 5,
                      paddingBottom: 5
                    }}
                  >
                    <Icon type='close-white' size={rf(14)} />
                  </TouchableOpacity>
                )}
              </Row>
              <TouchableOpacity
                onPress={() => onChange({ type: 'remove' })}
                onLongPress={() => onChange({ type: 'removeLong' })}
                style={{
                  width: wp(12),
                  backgroundColor: '#1b1816',
                  height: hp(5.6),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomColor: '#13100e',
                  borderBottomWidth: 2,
                  borderTopRightRadius: wp(4)
                }}
              >
                <Icon type='backspace' size={rf(20)} />
              </TouchableOpacity>
            </Row>
            <Col
              bg='#1b1816'
              wid={`${wp(100)}px`}
              centerAll={
                loading
                  ? true
                  : searchText && searchText.length > 0
                  ? searchResults &&
                    searchResults.length >= Math.floor(wp(100) / 44.5)
                    ? true
                    : false
                  : true
              }
            >
              {sections && sections.length > 0 && (
                <React.Fragment>
                  {loading ? (
                    <ActivityIndicator color={theme.WHITE} />
                  ) : (
                    <FlatList
                      ref={emojiListRef}
                      data={
                        searchText && searchText.length > 0
                          ? searchResults
                          : sections[activeMenu].data
                      }
                      keyboardShouldPersistTaps='always'
                      keyboardDismissMode='on-drag'
                      renderItem={renderEmoji}
                      keyExtractor={renderEmojiKey}
                      numColumns={Math.floor(
                        wp(100) / (rf(26) + wp(1.2) + wp(1.2) + 5)
                      )}
                      showsVerticalScrollIndicator={false}
                      style={{
                        paddingTop: hp(1.1),
                        paddingBottom: hp(1.1)
                      }}
                      removeClippedSubviews={true}
                    />
                  )}
                </React.Fragment>
              )}
            </Col>
            <Col
              bg='#1b1816'
              wid={`${wp(100)}px`}
              centerAll
              style={{
                maxHeight: hp(6.7),
                borderTopColor: theme.BLUE,
                borderTopWidth: 2
              }}
            >
              <FlatList
                data={categories}
                renderItem={renderEmojiCategory}
                keyExtractor={renderEmojiCatKey}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                removeClippedSubviews={true}
              />
            </Col>
          </Col>
        </KeyboardAvoidingView>
      ) : (
        <React.Fragment />
      )}
    </React.Fragment>
  )
}

export default EmojiKeyboard
