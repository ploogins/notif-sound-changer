const { React } = require('powercord/webpack');
const { getModule } = require('powercord/webpack');
const { TextInput, SliderInput } = require('powercord/components/settings');
const { Button, Text } = require('powercord/components');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.getSetting;
    this.state = {
      notifsounds: get('notifsounds', {}),
      playing: {}
    };
  }

  async componentDidMount () {
    this.setState({
      VerticalScroller: (await getModule([ 'AdvancedScrollerThin' ])).AdvancedScrollerThin,
      playSound: (await getModule([ 'playSound' ])).playSound
    });
  }

  render () {
    if (!this.state.VerticalScroller) {
      return null;
    }
    const { VerticalScroller, playSound } = this.state;
    const Sounds = {
      message1: 'Message',
      deafen: 'Deafen',
      undeafen: 'Undeafen',
      mute: 'Mute',
      unmute: 'Unmute',
      disconnect: 'Voice Disconnected',
      ptt_start: 'PTT Activate',
      ptt_stop: 'PTT Deactivate',
      user_join: 'User Join',
      user_leave: 'User Leave',
      user_moved: 'User Moved',
      call_calling: 'Outgoing Ring',
      call_ringing: 'Incoming Ring',
      stream_started: 'Stream Started',
      stream_ended: 'Stream Stopped',
      stream_user_joined: 'Viewer Join',
      stream_user_left: 'Viewer Leave',
      reconnect: 'Invited to Speak',
      discodo: 'Discodo Easter Egg',
    };
    return (
      <VerticalScroller>
        {/* <h5 className='h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi marginBottom8-AtZOdT'>
          Notification Sounds
        </h5> */}
        <div className='description-30xx7u formText-2ngGjI marginBottom20-315RVT modeDefault-2fEh7a primary-jw0I4K'>
          Customize notification sounds. You can put a link to any audio file in the textbox, or leave it blank to play the default sound. Use the slider to adjust the volume (only works on custom sounds).
        </div>
        {Object.keys(Sounds)
          .map((sound) =>
            <div className='nf-notification-sounds'>
              <Text className='nf-sound-title title-hptVG titleDefault-a8-ZSr medium-zmzTW- size16-rrJ6ag height20-mO2eIN'>
                <div className="vertical-3aLnqW flex-3BkGQD directionColumn-3pi1nm justifyStart-2Mwniq alignStretch-Uwowzr noWrap-hBpHBz marginBottom20-315RVT">
                  <label className='title-3hptVG titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                    {Sounds[sound]}
                  </label>
                </div>
              </Text>

              <div className='nf-setting-value-container'>
                <div className='nf-button-container nf-setting-value'>
                  <div className='vertical-3aLnqW flex-3BkGQD directionColumn-3pi1nm justifyStart-2Mwniq alignStretch-Uwowzr noWrap-hBpHBz marginBottom20-315RVT'>
                    <Button onClick={() => {
                      if (!this.state.notifsounds[sound] || !this.state.notifsounds[sound].url) {
                        playSound(sound);
                        return;
                      }
                      if (this.state.playing[sound]) {
                        this.state.playing[sound].pause();
                        delete this.state.playing[sound];
                      } else {
                      // eslint-disable-next-line new-cap
                        const player = new Audio(this.state.notifsounds[sound].url);
                        player.volume = this.state.notifsounds[sound] ? this.state.notifsounds[sound].volume ?? 0.5 : 0.5;
                        player.play();
                        player.addEventListener('ended', (event) => {
                          delete this.state.playing[sound];
                        });
                        this.state.playing[sound] = player;
                      }
                    }} className='nf-notification-sounds-icon icon-1UHTo2'/>
                    {//<div className='divider-_0um2u dividerDefault-3C2-ws'/>
                    }
                  </div>
                </div>
                <div className='nf-slider-container nf-setting-value'>
                  <SliderInput
                    initialValue={(this.state.notifsounds[sound] ? this.state.notifsounds[sound].volume : ((sound == 'stream_ended' && this.state.notifsounds['stream_stopped']) ? this.state.notifsounds['stream_stopped'].volume || 0.5 : 0.5)) * 100}
                    minValue={0}
                    maxValue={100}
                    className='nf-slider'
                    // onMarkerRender={marker => `${marker} ${Messages.SMART_TYPERS.USERS}`}
                    defaultValue={(this.state.notifsounds[sound] ? this.state.notifsounds[sound].volume : ((sound == 'stream_ended' && this.state.notifsounds['stream_stopped']) ? this.state.notifsounds['stream_stopped'].volume || 0.5 : 0.5)) * 100}
                    onValueChange={_.debounce((value) => {
                      if (!this.state.notifsounds[sound]) {
                        this.state.notifsounds[sound] = {};
                      }
                      if (sound == 'stream_ended' && this.state.notifsounds['stream_stopped']) {
                        this.state.notifsounds[sound] = this.state.notifsounds['stream_stopped'];
                      }
                      this.state.notifsounds[sound].volume = value / 100;
                      this.props.updateSetting('notifsounds', this.state.notifsounds);
                    }, 500)}
                  ></SliderInput>
                </div>
                <div className='nf-setting-value'>
                  <TextInput
                    onChange={(value) => {
                      if (!this.state.notifsounds[sound]) {
                        this.state.notifsounds[sound] = {};
                      }
                      if (sound == 'stream_ended' && this.state.notifsounds['stream_stopped']) {
                        this.state.notifsounds[sound] = this.state.notifsounds['stream_stopped'];
                      }
                      this.state.notifsounds[sound].url = value;
                      this.state.notifsounds[sound].volume = this.state.notifsounds[sound].volume || 0.5;
                      if (this.state.notifsounds[sound].url === '') {
                        delete this.state.notifsounds[sound];
                      }
                      this.props.updateSetting('notifsounds', this.state.notifsounds);
                    }}
                    className='nf-textarea-notifsounds'
                    placeholder='Link to audio file'
                    defaultValue={this.state.notifsounds[sound] ? this.state.notifsounds[sound].url : ((sound == 'stream_ended' && this.state.notifsounds['stream_stopped']) ? this.state.notifsounds['stream_stopped'].url : '')}
                  />
                </div>
              </div>
            </div>
          )
        }
      </VerticalScroller>
    );
  }
};
