const { React } = require('powercord/webpack');
const { getModule, getModuleByDisplayName } = require('powercord/webpack');
const { SwitchItem, TextInput } = require('powercord/components/settings');
const path = require('path');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.getSetting;
    this.state = {
      notifsounds: get('notifsounds', {}),
      plugin: powercord.pluginManager.get(__dirname.split(path.sep).pop())
    };
  }

  async componentDidMount () {
    this.setState({
      VerticalScroller: (await getModule([ 'AdvancedScrollerThin' ])).AdvancedScrollerThin,
      Text: await getModuleByDisplayName('Text'),
      playSound: (await getModule([ 'playSound' ])).playSound
    });
  }

  render () {
    if (!this.state.VerticalScroller) {
      return null;
    }
    const { Text, playSound } = this.state;
    const Sounds = {
      message1: 'Message',
      call_ringing: 'Incoming Call',
      call_calling: 'Outgoing Call',
      user_join: 'User Joining Voice Channel'
    };
    return (
      <this.state.VerticalScroller>
        {/* <h5 className='h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi marginBottom8-AtZOdT'>
          Notification Sounds
        </h5> */}
        <div className='description-3_Ncsb formText-3fs7AJ marginBottom20-32qID7 modeDefault-3a2Ph1 primary-jw0I4K'>
          Customize notification sounds. You can put a link to an MP3 file in the textbox, or leave it blank to play the default sound.
        </div>
        {Object.keys(Sounds)
          .map((sound) =>
            <div className='nf-notification-sounds' style={{ marginBottom: '16px' }}>
              <div style={{ float: 'left' }}>
                <Text className='title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                  <label className='title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                    {Sounds[sound]}
                  </label>
                </Text>
              </div>

              <div style={{ float: 'right' }}>
                <div style={{ float: 'left' }}>
                  <button onClick={() => playSound(sound)} className='nf-notification-sounds-icon button-1Pkqso iconButton-eOTKg4 button-38aScr lookOutlined-3sRXeN colorWhite-rEQuAQ buttonSize-2Pmk-w iconButtonSize-U9SCYe grow-q77ONN'/>
                </div>
                <div style={{ float: 'right',
                  paddingLeft: '16px' }}>
                  <TextInput
                    onChange={(value) => {
                      this.state.notifsounds[sound] = { url: value,
                        volume: 0.4 };
                      this._set('notifsounds', this.state.notifsounds);
                      this.state.plugin.reload();
                    }}
                    className='nf-textarea-notifsounds'
                    style={{ height: '33px' }}
                    placeholder='Link to MP3 file'
                    defaultValue={this.state.notifsounds[sound] ? this.state.notifsounds[sound].url : ''}
                  />
                </div>
              </div>
            </div>
          )
        }
      </this.state.VerticalScroller>
    );
  }

  _set (key, value, defaultValue) {
    if (!value && defaultValue) {
      value = defaultValue;
    }

    this.props.updateSetting(key, value);
    this.setState({ [key]: value });
  }
};
