import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import '../locales/index';
import { useTranslation } from 'react-i18next';

const CommandInfo = () => {

  const {t} = useTranslation();
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoText}>{t('commandInfo.availableCommands')}</Text>
      <Text style={styles.infoText}>{t('commandInfo.code')}</Text>
      <Text style={styles.infoText}>{t('commandInfo.count')}</Text>
      <Text style={styles.infoText}>{t('commandInfo.Rest')}</Text>
      <Text style={styles.infoText}>{t('commandInfo.Back')}</Text>
      <Text style={styles.infoText}> </Text>
      <Text style={styles.infoText}>{t('commandInfo.newCodeInfo')}</Text>
      <Text style={styles.infoText}>{t('commandInfo.info1')}</Text>
      <Text style={styles.infoText}>{t('commandInfo.info2')}</Text>
      <Text style={styles.infoText}>{t('commandInfo.info3')}</Text>
      <Text style={styles.infoText}> </Text>
      <Text style={styles.infoText}>{t('commandInfo.warning')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
});

export default CommandInfo;