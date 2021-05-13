import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, Text, TouchableHighlight, View } from 'react-native';
import styles from './styles';
import Moment from 'moment';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { isValid } from '@sorakrisc/react-native-datetimepicker/src/helpers/dateHelpers';

const _monthList = [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

class YearMonthDayDatePicker extends Component {

    constructor (props) {
        super(props);
        this.defaultPickerValue = {
            year: Moment().year().toString(),
            month: '1',
            day: '1'
        };
        this.state = {
            type: 'year',
            'pickerValue-year' : this.defaultPickerValue.year,
            'pickerValue-month' : this.defaultPickerValue.month,
            'pickerValue-day' : this.defaultPickerValue.day

        };
    }

    upperCaseFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    getMinDate = (unitName) => {
        const { minDate, year, month } = this.props;
        let minResult = this.props['min' + this.upperCaseFirstLetter(unitName)];

        // // if day check for leap year
        // if(unitName === 'day') {
        //     minResult = Math.max(minDay, Moment(`${year}-${month}`, `${inputYearFormat}-${inputMonthFormat}`).daysInMonth() );
        // }

        if (minDate) {
            const dateMinDate = Moment(minDate, 'DMYYYY');
            switch (unitName) {
                case 'day':
                    // check if year and month selected greater or equal to maxDate year and month
                    if(year <= dateMinDate.year() && month <= dateMinDate.month() + 1 ) {
                        minResult = Math.max(minResult, dateMinDate.date());
                    }
                    break;
                case 'month':
                    // check if year selected greater or equal to maxDate year
                    if(year <= dateMinDate.year() ) {
                        minResult = Math.max(minResult, dateMinDate.month() + 1);
                    }
                    break;
                case 'year':
                    minResult = Math.max(minResult, dateMinDate.year());
                    break;
                default:
                    break;
            }
        }

        return minResult;
    };

    getMaxDate = (unitName) => {
        const { maxDate, year, month, inputYearFormat, inputMonthFormat } = this.props;

        //get Max from props maxDay maxMonth maxYear by unitName
        let maxResult = this.props['max' + this.upperCaseFirstLetter(unitName)];

        // if day check for leap year
        if(unitName === 'day') {
            maxResult = Math.min(maxResult, Moment(`${year}-${month}`, `${inputYearFormat}-${inputMonthFormat}`).daysInMonth() );
        }
        // if maxDate is sepecify maxResult must not exceed the maxDate
        if (maxDate) {
            const dateMaxDate = Moment(maxDate, 'DDMYYYY');
            switch (unitName) {
                case 'day':
                    // check if year and month selected greater or equal to maxDate year and month
                    if(year >= dateMaxDate.year() && month >= dateMaxDate.month() + 1 ) {
                        maxResult = Math.min(maxResult, dateMaxDate.date());
                    }
                    break;
                case 'month':
                    // check if year selected match with maxDate year
                    if(year >= dateMaxDate.year()) {
                        maxResult = Math.min(maxResult, dateMaxDate.month() + 1);
                    }
                    break;
                case 'year':
                    maxResult = Math.min(maxResult, dateMaxDate.year());
                    break;
                default:
                    break;
            }
        }
        return maxResult;
    };


    getYearItems = () => {
        const items = [];
        const { yearInterval, yearUnit, calendarType } = this.props;
        const minYear = this.getMinDate('year');
        const maxYear = this.getMaxDate('year');
        const interval = maxYear / yearInterval;
        const valueAddOn = calendarType === 'buddhist' ? 543 : 0;
        for (let i = minYear; i <= interval; i++) {
            const value = i * yearInterval;
            const valueString = `${value}`;
            const item = (
                <Picker.Item key={valueString} value={valueString}
                             label={`${value + valueAddOn}` + yearUnit}/>
            );
            items.push(item);
        }
        return items;
    };
    getMonthItems = () => {
        const { monthInterval, monthUnit, monthList, initialMonthPicker } = this.props;
        const items = [...initialMonthPicker];
        const actualMaxMonth = this.getMaxDate('month');
        const actualMinMonth = this.getMinDate('month');
        const interval = actualMaxMonth / monthInterval;

        for (let i = actualMinMonth; i <= interval; i++) {
            const monthIndex = (i - 1) * monthInterval;
            const value = monthList[monthIndex];
            const item = (
                <Picker.Item key={value} value={i.toString()}
                             label={value + monthUnit}/>
            );
            items.push(item);
        }
        return items;
    };
    getDayItems = () => {
        const { dayInterval, dayUnit, initialDayPicker, dayStartWithZero } = this.props;
        const items = [...initialDayPicker];
        // interval = getmaxdateday / day interval (2, [2,4,8..])
        const actualMaxDay = this.getMaxDate('day');
        const actualMinDay = this.getMinDate('day');
        const interval = actualMaxDay / dayInterval;

        for (let i = actualMinDay; i <= interval; i++) {
            const value = `${i * dayInterval}`;
            let displayValue = value;
            if(dayStartWithZero && value.length<2){
                displayValue ='0'+value;
            }
            const item = (
                <Picker.Item key={value} value={value}
                             label={displayValue + dayUnit}/>
            );
            items.push(item);
        }
        return items;
    };

    getPickerItems = () => {
        switch (this.state.type){
            case 'year':
                return this.getYearItems();
            case 'month':
                return this.getMonthItems();
            case 'day':
                return this.getDayItems();
        }
    };

    getConfirmDate = () => {
        const { year, month, day, initialDayPicker } = this.props;
        const { type } = this.state;
        const changedValue = this.state[`pickerValue-${type}`];
        const ret = { year, month, day };
        switch (type){
            case 'year':
                ret.year = changedValue;
                break;
            case 'month':
                ret.month = changedValue;
                break;
            case 'day':
                ret.day = changedValue;
                break;
        }
        // if month or year is changed might cause invalid day to occur e.g. 2021/02/29
        // must not change if day is a customize value developer must handle externally
        if(!isValid(ret)) {
            const initialDayValues = initialDayPicker.map(initialDayValue=> initialDayValue?.props?.value)
            if(!initialDayValues.includes(ret.day)) {
                ret.day = ''
            }
        }
        return ret;
    };

    onCancel = () => {

        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel(this.getConfirmDate());
        }
        this.close();
    };

    onConfirm = () => {
        if (typeof this.props.onConfirm === 'function') {
            this.props.onConfirm(this.getConfirmDate());
        }
        this.close();
    };

    close = () => {
        this.RBSheet.close();
    };

    open = (type) => {
        // dismiss keyboard if rbsheet is open (when close it will not reopen keyboard)
        Keyboard.dismiss();
        let pickerValueType = this.props[type];
        if(!pickerValueType){
            const minValue = this.getMinDate(type);
            if(type === 'year'){
                pickerValueType = this.defaultPickerValue[type];
            }
            else if( this.getMinDate(type) > this.getMaxDate(type) ) {
                const ini = this.props[`initial${this.upperCaseFirstLetter(type)}Picker`];
                if (ini.length > 0) {
                    pickerValueType = ini[0].props.value;
                }
            } else {
                pickerValueType = minValue.toString();
            }
        }

        this.setState({
            type,
            [`pickerValue-${type}`]:pickerValueType
        }, () => {
            this.RBSheet.open();
        });

    };

    renderHeader = () => {
        const { confirmBtnText, cancelBtnText, textTitle, TouchableComponent, textTitleStyle } = this.props;
        return (
            <View style={styles.header}>
                <TouchableComponent underlayColor={'transparent'}
                                    onPress={this.onCancel}
                                    style={styles.buttonAction}>
                    <Text style={[styles.buttonText]}>
                        {cancelBtnText}
                    </Text>
                </TouchableComponent>
                {textTitle ?
                <View style={styles.buttonAction}>
                    <Text style={[
                        styles.buttonText,
                        { color: 'black' },
                        textTitleStyle
                    ]}>{textTitle({ type:this.state.type })}</Text>
                </View>: null}
                <TouchableComponent underlayColor={'transparent'}
                                    onPress={this.onConfirm}
                                    style={styles.buttonAction}>
                    <Text style={styles.buttonText}>{confirmBtnText}</Text>
                </TouchableComponent>
            </View>
        );
    };

    renderBody = () => {
        const { pickerProps, onPickerValueChange } = this.props;
        const { type } = this.state;
        const selectedValueKey = 'pickerValue-'+this.state.type;
        const selectedValue = this.state[selectedValueKey];
        return (
            <View style={styles.body}>
                <Picker
                    selectedValue={selectedValue}
                    style={[styles.picker, pickerProps.styles]}
                    onValueChange={itemValue => {
                        this.setState({ [selectedValueKey]: itemValue }, () => {
                            onPickerValueChange({ type, itemValue });
                        });
                    }}
                    {...pickerProps}
                >
                    {this.getPickerItems()}
                </Picker>
            </View>
        );
    };

    isInputDisable=(type) => {
        if(type === 'year') {
            return false;
        } else if (type === 'month') {
            return !this.props.year?.length>0;
        } else {
            return !(this.props.year?.length>0 && this.props.month?.length>0 && parseInt(this.props.month));
        }
    };

    renderInputComponent = ({ type }) => {
        const { inputComponent, placeholder, TouchableComponent,
            TouchableComponentProps, inputStyle, placeholderTextStyle,
            iconComponent, textStyle, inputComponentStyle
        } = this.props;
        const value = this.props[type];
        const disabled = this.isInputDisable(type);
        return <View style={[{ flex:1 }, inputComponentStyle]}>
            <TouchableComponent
                underlayColor={'transparent'}
                onPress={() => this.open(type)}
                disabled={disabled}
                {...TouchableComponentProps}
            >
                {
                    inputComponent ?
                        inputComponent({ type, value, disabled })
                        :
                        <View style={[styles.input, inputStyle]}>
                            {value && value.length > 0 ?
                                <Text
                                    style={[
                                        styles.text,
                                        textStyle
                                    ]}>{value}</Text>
                                :
                                <Text style={[
                                    styles.placeholderText,
                                    placeholderTextStyle
                                ]}>{placeholder? placeholder[type]: type}</Text>}
                            {iconComponent? iconComponent(type): null}
                        </View>
                }
            </TouchableComponent>
        </View>;
    };

    renderInput = () => {
        const { showInput, inputContainerStyles } = this.props;
        if (showInput) {
            return (
                <View style={[styles.inputContainer, inputContainerStyles]}>
                    {this.renderInputComponent({ type: 'year' })}
                    {this.renderInputComponent({ type: 'month' })}
                    {this.renderInputComponent({ type: 'day' })}
                </View>
            );
        }
        return null;
    };

    render () {
        return (
            <View>
                <RBSheet
                    ref={ref => {
                        this.RBSheet = ref;
                    }}
                >
                    {this.renderHeader()}
                    {this.renderBody()}
                </RBSheet>
                {this.renderInput()}
            </View>
        );
    }
}

YearMonthDayDatePicker.propTypes = {
    year: PropTypes.string, // selected year
    month: PropTypes.string, // selected month
    day: PropTypes.string, // selected day
    inputYearFormat: PropTypes.string, // selected year format
    inputMonthFormat: PropTypes.string, // selected month format
    inputDayFormat: PropTypes.string, // selected day format
    showInput: PropTypes.bool, // boolean true show input (either default or props inputComponent)
    TouchableComponent: PropTypes.any, // touchable component
    TouchableComponentProps: PropTypes.any, // touchable component customize props
    textStyle: PropTypes.any,
    placeholder: PropTypes.string, // placeholder for default input if inputcomponent is not provided
    placeholderTextStyle: PropTypes.any,
    inputContainerStyles: PropTypes.any,
    iconComponent: PropTypes.any,
    inputComponentStyle: PropTypes.any,
    inputComponent: PropTypes.func, //input component function that render customize input
    inputStyle: PropTypes.any,

    textTitle: PropTypes.func,
    textTitleStyle: PropTypes.any,

    pickerProps: PropTypes.any,
    calendarType: PropTypes.oneOf(['gregorian, buddhist']),
    monthList: PropTypes.arrayOf(PropTypes.string),
    confirmBtnText: PropTypes.string,
    cancelBtnText: PropTypes.string,
    minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    minYear: PropTypes.number,
    minMonth: PropTypes.number,
    minDay: PropTypes.number,
    maxDay: PropTypes.number,
    maxMonth: PropTypes.number,
    maxYear: PropTypes.number,
    dayInterval: PropTypes.number,
    monthInterval: PropTypes.number,
    yearInterval: PropTypes.number,
    dayUnit: PropTypes.string,
    monthUnit: PropTypes.string,
    yearUnit: PropTypes.string,
    initialMonthPicker: PropTypes.arrayOf(PropTypes.any), // item added to the front of array of picker item
    initialDayPicker: PropTypes.arrayOf(PropTypes.any), // item added to the front of array of picker item
    dayStartWithZero: PropTypes.bool,
    onPickerValueChange: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func
};

YearMonthDayDatePicker.defaultProps = {
    year: '',
    month: '',
    day: '',
    inputYearFormat: 'YYYY',
    inputMonthFormat: 'MM',
    inputDayFormat: 'DD',
    showInput: true,
    TouchableComponent: TouchableHighlight,
    TouchableComponentProps: {},
    textStyle: {},
    placeholder: '',
    placeholderTextStyle: null,
    inputContainerStyles: null,
    iconComponent: null,
    inputComponentStyle: null,
    inputComponent: null, //input component function that render customize input
    inputStyle: {},

    textTitle: null,
    textTitleStyle: {},

    pickerProps: {},
    calendarType: 'gregorian',
    monthList: _monthList,
    confirmBtnText: 'Done',
    cancelBtnText: 'Cancel',
    minYear: 1,
    minMonth: 1,
    minDay: 1,
    maxDay: 31,
    maxMonth: 12,
    maxYear: 9999,
    monthInterval: 1,
    yearInterval: 1,
    dayInterval: 1,
    dayUnit: '',
    monthUnit: '',
    yearUnit: '',
    initialMonthPicker: [],
    initialDayPicker: [],
    dayStartWithZero: false,
    onPickerValueChange: () => {},
    onConfirm: null,
    onCancel: null
};

export default YearMonthDayDatePicker;
