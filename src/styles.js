import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  header: {
    height: 45,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonAction: {
    height: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#006BFF',
    fontWeight: '400',
  },
  buttonTextCancel: {
    color: '#666',
    fontWeight: '400',
  },
  body: {
    flexDirection: 'row',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  picker: {
    flex: 1,
  },
  placeholderText: {
    color: '#c9c9c9',
    fontSize: 18,
  },
  separator: {
    alignSelf: 'center',
    fontSize: 16,
  },
  text: {
    fontSize: 18,
  },
});

export default styles;
