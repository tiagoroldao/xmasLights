// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
char input;

void receiveCommand(){
  int i=0;
  unsigned long startTime = millis();
  bool started = false;
  do{
    if(Serial.available()>0){
      input = Serial.read();
      if((started || input != 'Z') && input != '\n' && input != '\r')
        {
          started = true;
          btData[i++] = input;
          btData[i] = '\0';
        }
    }
  }while(input != '\r' && millis() - startTime < 20);
}

String getValue(String data, char separator, int index)
{
    int found = 0;
    int strIndex[] = { 0, -1 };
    int maxIndex = data.length() - 1;

    for (int i = 0; i <= maxIndex && found <= index; i++) {
        if (data.charAt(i) == separator || i == maxIndex) {
            found++;
            strIndex[0] = strIndex[1] + 1;
            strIndex[1] = (i == maxIndex) ? i+1 : i;
        }
    }
    return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
