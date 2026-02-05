import { Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Sidebar from '@/components/sidebar';
import { SidebarProvider } from '@/contexts/sidebar-context';

function TabsLayoutContent() {
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <SidebarProvider>
      <TabsLayoutContent />
    </SidebarProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
