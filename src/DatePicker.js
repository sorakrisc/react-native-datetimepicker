import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableHighlight, View } from 'react-native';
import styles from './styles';
import Moment from 'moment';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { isValid } from './helpers/dateHelpers';

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
// const monthsWith31Days = ['1', '3', '5', '7', '8', '10', '12'];
// const monthsWith30Days = ['4', '6', '9', '11'];

class DatePicker extends Component {
    constructor (props) {
        super(props);
        const { selectedDay, selectedMonth, selectedYear, date } = props;
        // const date = this.props.date ;
        const parsedDate = this._getDate(date);
        this.state = {
            selectedDay: parsedDate.date().toString(),
            selectedMonth: (parsedDate.month() + 1).toString(),
            selectedYear: parsedDate.year().toString(),
            date,
            pickerDayKey: 0
        };
    }

    _getDate (date = this.props.date, format = this.props.format) {
        const { minDate, maxDate } = this.props;

        // date默认值
        if (!date) {
            let now = Moment();
            if (minDate) {
                let _minDate = this._getDate(minDate);

                if (now < _minDate) {
                    return _minDate;
                }
            }

            if (maxDate) {
                let _maxDate = this._getDate(maxDate);

                if (now > _maxDate) {
                    return _maxDate;
                }
            }

            return now;
        }

        if (date instanceof Date) {
            return date;
        }

        return Moment(date, format);
    }

    _getDateStr (date = this.props.date) {
        const { mode, format = FORMATS[mode] } = this.props;

        const dateInstance = date instanceof Date
            ? date
            : this.getDate(date);

        if (typeof this.props.getDateStr === 'function') {
            return this.props.getDateStr(dateInstance);
        }

        return Moment(dateInstance).format(format);
    }

    selectedMonthHaveDay = (day) => {
        //every month have at least 28 days
        if (day <= 28) {
            return true;
        } else {
            //handle case for day 28,29,30,31
            const { selectedMonth, selectedYear } = this.state;
            return isValid({day, month: selectedMonth, year: selectedYear});
        }

    };

    getMinDate = (unitName) => {
        const { minDate } = this.props;
        if (minDate) {
            const dateMinDate = Moment(minDate, 'DDMYYYY');
            switch (unitName) {
                case 'Day':
                    return dateMinDate.day();
                case 'Month':
                    return dateMinDate.month() + 1;
                case 'Year':
                    const min = dateMinDate.year();
                    this.props['min' + unitName] = min;
                    return min;
            }
            return null;
            // this.props['min' + unitName] = minUnitName;
            // return minUnitName;
        } else {
            return this.props['min' + unitName];
        }

    };

    getMaxDate = (unitName) => {
        const { maxDate } = this.props;
        if (maxDate) {
            const dateMaxDate = Moment(maxDate, 'DDMYYYY');
            switch (unitName) {
                case 'Day':
                    return dateMaxDate.day();
                case 'Month':
                    return dateMaxDate.month() + 1;
                case 'Year':
                    const max = dateMaxDate.year();
                    this.props['max' + unitName] = max;
                    return max;
            }
            return null;
        } else {
            return this.props['max' + unitName];
        }
    };

    getYearItems = () => {
        const items = [];
        const { yearInterval, yearUnit, calendarType } = this.props;
        const minYear = this.getMinDate('Year');
        const maxYear = this.getMaxDate('Year');
        const interval = maxYear / yearInterval;
        const valueAddOn = calendarType === 'gregorian' ? 0 : 543;
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
        const items = [];
        const { minMonth, maxMonth, monthInterval, monthUnit, monthList } = this.props;
        const interval = maxMonth / monthInterval;

        for (let i = minMonth; i <= interval; i++) {
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
        const items = [];
        const { minDay, maxDay, dayInterval, dayUnit } = this.props;
        const interval = maxDay / dayInterval;
        for (let i = minDay; i <= interval; i++) {
            if (this.selectedMonthHaveDay(i)) {
                const value = `${i * dayInterval}`;
                const item = (
                    <Picker.Item key={value} value={value}
                                 label={value + dayUnit}/>
                );
                items.push(item);
            }
        }
        return items;
    };

    onValueChange = (selectedDay, selectedMonth, selectedYear) => {
        let items = [];
        const minDate = this._getDate(this.props.minDate);
        const maxDate = this._getDate(this.props.maxDate);
        const valueDate = this._getDate(
            `${selectedDay}/${selectedMonth}/${selectedYear}`, 'D/M/YYYY');
        if (this.props.minDate && valueDate.isBefore(minDate)) {
            this.setState({
                selectedDay: minDate.date().toString(),
                selectedMonth: (minDate.month() + 1).toString(),
                selectedYear: minDate.year().toString()
            });
        } else if (this.props.maxDate && valueDate.isAfter(maxDate)) {
            this.setState({
                selectedDay: maxDate.date().toString(),
                selectedMonth: (maxDate.month() + 1).toString(),
                selectedYear: maxDate.year().toString()
            });
        } else {
            if (isValid({ day: selectedDay, month: selectedMonth, year: selectedYear})) {
                this.setState({ selectedDay, selectedMonth, selectedYear });
            } else {
                const correctSelectedDay = Moment(`01/${selectedMonth}/${selectedYear}`, 'DDMYYYY').endOf('month').format('DD');
                this.setState({ selectedDay: correctSelectedDay, selectedMonth, selectedYear, pickerDayKey: this.state.pickerDayKey + 1 })
            }

        }

    };

    getDate = () => {
        const { selectedDay, selectedMonth, selectedYear } = this.state;
        return Moment(selectedDay + '/' + selectedMonth + '/' + selectedYear,
            'DD/MM/YYYY').format(this.props.format);
    };

    onCancel = () => {
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel(this.getDate());
        }
        this.close();
    };

    onConfirm = () => {
        const date = this.getDate();
        this.setState({ date }, () => {
            if (typeof this.props.onConfirm === 'function') {
                this.props.onConfirm(date);
            }
            this.close();
        });
    };

    close = () => {
        this.RBSheet.close();
    };

    open = () => {
        const parsedDate = this._getDate(this.props.date);
        this.setState({
            selectedDay: parsedDate.date().toString(),
            selectedMonth: (parsedDate.month() + 1).toString(),
            selectedYear: parsedDate.year().toString()
        });
        this.RBSheet.open();
    };

    renderHeader = () => {
        const { confirmBtnText, cancelBtnText, textTitle, TouchableComponent } = this.props;
        return (
            <View style={styles.header}>
                <TouchableComponent underlayColor={'transparent'}
                                    onPress={this.onCancel}
                                    style={styles.buttonAction}>
                    <Text style={[styles.buttonText]}>
                        {cancelBtnText}
                    </Text>
                </TouchableComponent>
                {textTitle &&
                <View style={styles.buttonAction}>
                    <Text style={[
                        styles.buttonText,
                        { color: 'black', fontWeight: '500' }]}>{textTitle}</Text>
                </View>}
                <TouchableComponent underlayColor={'transparent'}
                                    onPress={this.onConfirm}
                                    style={styles.buttonAction}>
                    <Text style={styles.buttonText}>{confirmBtnText}</Text>
                </TouchableComponent>
            </View>
        );
    };

    renderBody = () => {
        const { selectedDay, selectedMonth, selectedYear, pickerDayKey } = this.state;

        return (
            <View style={styles.body}>
                <Picker
                    key={pickerDayKey}
                    selectedValue={selectedDay}
                    style={styles.picker}
                    itemStyle={this.props.itemStyle}
                    onValueChange={itemValue =>
                        this.onValueChange(itemValue, selectedMonth, selectedYear)
                    }
                >
                    {this.getDayItems()}
                </Picker>
                <Picker
                    selectedValue={selectedMonth}
                    style={styles.picker}
                    itemStyle={this.props.itemStyle}
                    onValueChange={itemValue =>
                        this.onValueChange(selectedDay, itemValue, selectedYear)
                    }
                >
                    {this.getMonthItems()}
                </Picker>
                <Picker
                    selectedValue={selectedYear}
                    style={styles.picker}
                    itemStyle={this.props.itemStyle}
                    onValueChange={itemValue =>
                        this.onValueChange(selectedDay, selectedMonth, itemValue)
                    }
                >
                    {this.getYearItems()}
                </Picker>
            </View>
        );
    };

    renderInput = () => {
        const { inputStyle, textStyle, placeholderTextStyle, iconComponent, TouchableComponent, showInput, inputComponent } = this.props;
        if (showInput) {
            if (inputComponent) {
                return (
                    <TouchableComponent underlayColor={'transparent'}
                                        onPress={() => this.open()}
                    >
                        {inputComponent}
                    </TouchableComponent>
                );
            } else {
                return (
                    <TouchableComponent underlayColor={'transparent'}
                                        onPress={() => this.open()}
                    >
                        <View style={[styles.input, inputStyle]}>
                            {this.props.date && this.props.date.length > 0 ?
                                <Text
                                    style={[
                                        styles.text,
                                        textStyle]}>{this.props.date}</Text>
                                :
                                <Text style={[
                                    styles.placeholderText,
                                    placeholderTextStyle]}>{this.props.placeholder}</Text>}
                            {iconComponent}
                        </View>
                    </TouchableComponent>
                );
            }
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

DatePicker.propTypes = {
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
    dayUnit: PropTypes.string,
    monthUnit: PropTypes.string,
    selectedDay: PropTypes.string,
    selectedYear: PropTypes.string,
    itemStyle: PropTypes.object,
    textCancel: PropTypes.string,
    textConfirm: PropTypes.string,
    textTitle: PropTypes.string,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    format: PropTypes.string,
    inputStyle: PropTypes.object,
    textStyle: PropTypes.object,
    placeholderTextStyle: PropTypes.object,
    iconComponent: PropTypes.element,
    date: PropTypes.oneOfType(
        [PropTypes.string, PropTypes.instanceOf(Date), PropTypes.object]),
    confirmBtnText: PropTypes.string,
    cancelBtnText: PropTypes.string,
    placeholder: PropTypes.string,
    calendarType: PropTypes.oneOf(['gregorian, buddhist']),
    showInput: PropTypes.boolean,
    inputComponent: PropTypes.any
};

DatePicker.defaultProps = {
    minYear: 1,
    minMonth: 1,
    minDay: 1,
    maxDay: 31,
    maxMonth: 12,
    maxYear: 9999,
    monthList: _monthList,
    monthInterval: 1,
    yearInterval: 1,
    dayInterval: 1,
    dayUnit: '',
    monthUnit: '',
    yearUnit: '',
    selectedDay: '28',
    selectedMonth: '2',
    selectedYear: '2000',
    itemStyle: {},
    confirmBtnText: 'Done',
    cancelBtnText: 'Cancel',
    textTitle: null,
    format: 'DD/MM/YYYY',
    TouchableComponent: TouchableHighlight,
    date: '',
    placeholder: '',
    calendarType: 'gregorian',
    showInput: true
};

export default DatePicker;
