const Lang = imports.lang;
var GObject = imports.gi.GObject;
const UPower = imports.gi.UPowerGlib;
const BaseIndicator = imports.ui.status.system.Indicator;

var Indicator = GObject.registerClass(
	{
	GTypeName: 'Indicator'
	},
	class Indicator extends BaseIndicator
	{
   _getBatteryStatus() {
      let seconds = 0;


	  let proxy = this._systemItem.powerToggle._proxy;
      let state = proxy.State;
      const percentage = Math.round(proxy.Percentage) + '%'

      // Ensure percentage label is enabled regardless of gsettings
      this._percentageLabel.visible = true

      if (state == UPower.DeviceState.FULLY_CHARGED) {
         return '\u221E';
      } else if (state == UPower.DeviceState.CHARGING) {
         seconds = proxy.TimeToFull;
      } else if (state == UPower.DeviceState.DISCHARGING) {
         seconds = proxy.TimeToEmpty;
      } else if (state == UPower.DeviceState.PENDING_CHARGE) {
         // 'not charging' (ThinkPad status charging-threshold reached) is treated as PENDING_CHARGE
         return _("~ (%s)").format(percentage);
      } else {
         // state is PENDING_DISCHARGE
         return _("… (%s)").format(percentage);
      }

      let time = Math.round(seconds / 60);
      if (time == 0) {
         // 0 is reported when UPower does not have enough data
         // to estimate battery life
         return _("… (%s)").format(percentage);
      }

      let minutes = time % 60;
      let hours = Math.floor(time / 60);

      // Translators: this is <hours>:<minutes>
      return _("%d\u2236%02d (%s)").format(hours, minutes, percentage);
   }

   _sync() {
      super._sync();
      this._percentageLabel.clutter_text.set_markup(this._getBatteryStatus());
   }
}
);
