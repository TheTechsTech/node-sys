do shell script "xcode-select --install"
do shell script "sleep 1"

tell application "System Events"
	tell process "Install Command Line Developer Tools"
		keystroke return
		click button "Agree" of window "License Agreement"
	end tell
end tell

do shell script "curl -fsSL -o install.sh https://raw.githubusercontent.com/Homebrew/install/master/install.sh"
do shell script "sleep 1"
do shell script "/bin/bash install.sh"
