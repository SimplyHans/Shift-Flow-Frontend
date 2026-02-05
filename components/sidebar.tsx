import { Colors } from '@/constants/theme';
import { useSidebar } from '@/contexts/sidebar-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

type NavItem = {
  label: string;
  href: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const SHIFTS_ITEMS: NavItem[] = [
  { label: 'Schedule', href: '/(tabs)/schedule', icon: 'calendar-today' },
  { label: 'Open Shifts', href: '/(tabs)/open-shifts', icon: 'work' },
  { label: 'Requests', href: '/(tabs)/requests', icon: 'mark-email-unread' },
];

const STORE_ITEMS: NavItem[] = [
  { label: 'Team', href: '/(tabs)/team', icon: 'people' },
  { label: 'Availability', href: '/(tabs)/availability', icon: 'event-available' },
];

export default function Sidebar() {
  const router = useRouter();
  const { isExpanded, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const colors = Colors[colorScheme ?? 'light'];
  const isCompact = !isExpanded;
  const sidebarWidth = isCompact ? 56 : 300;

  const handleLogout = () => {
    setShowLogoutMenu(false);
    router.replace('/auth/login');
  };

  const renderNavButton = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Pressable
        key={item.href}
        onPress={() => router.push(item.href as any)}
        style={({ pressed }) => [
          styles.navButton,
          isActive && [styles.navButtonActive, { backgroundColor: '#6579FF' }],
          pressed && { opacity: 0.8 },
        ]}
      >
        <MaterialIcons
          name={item.icon}
          size={20}
          color={isActive ? colors.tint : colors.icon}
        />
        {!isCompact && (
          <Text
            style={[
              styles.navLabel,
              { color: isActive ? colors.tint : colors.text },
              isActive && styles.navLabelActive,
            ]}
          >
            {item.label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <>
      <View
  style={[
    styles.sidebar,
    {
      width: sidebarWidth,
      minWidth: isCompact ? 56 : 180,
      backgroundColor: colors.secondClr,
    },
  ]}>
        {/* Header */}
        <View style={[styles.header, isCompact && styles.headerCompact]}>
          {!isCompact && (
            <Text style={[styles.title, { color: colors.text }]}>SHIFT 
            FLOW</Text>
          )}
          <Pressable
            onPress={toggleSidebar}
            style={({ pressed }) => [styles.minimizeBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons
              name={isCompact ? 'chevron-right' : 'chevron-left'}
              size={24}
              color={colors.icon}
            />
          </Pressable>
        </View>

        {/* Categories */}
        <View style={styles.navSection}>
          {!isCompact && (
            <Text style={[styles.categoryLabel, { color: colors.icon }]}>Shifts</Text>
          )}
          {SHIFTS_ITEMS.map(renderNavButton)}
        </View>

        <View style={styles.navSection}>
          {!isCompact && (
            <Text style={[styles.categoryLabel, { color: colors.icon }]}>Store</Text>
          )}
          {STORE_ITEMS.map(renderNavButton)}
        </View>

        {/* Bottom - Logout area */}
        <View style={styles.spacer} />
        <Pressable
          onPress={() => setShowLogoutMenu(true)}
          style={({ pressed }) => [
            styles.logoutArea,
            { backgroundColor: '#7285ff' , borderColor: '#8495ff' },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text
            style={[styles.logoutPlaceholder, { color: colors.text }]}
            numberOfLines={1}
          >
            {isCompact ? '' : 'Account'}
          </Text>
          <MaterialIcons name="more-vert" size={22} color={colors.icon} />
        </Pressable>
      </View>

      {/* Logout menu modal */}
      <Modal
        visible={showLogoutMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLogoutMenu(false)}
        >
          <View style={[styles.logoutMenu, { backgroundColor: colors.background }]}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [styles.logoutMenuItem, pressed && { opacity: 0.7 }]}
            >
              <MaterialIcons name="logout" size={20} color="#c62828" />
              <Text style={styles.logoutMenuText}>Log out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 0,
    alignSelf: 'stretch',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingVertical: 12,
    minWidth: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  headerCompact: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
  minimizeBtn: {
    padding: 4,
  },
  navSection: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  navButtonActive: {
     
  },
  navLabel: {
    fontSize: 15,
  },
  navLabelActive: {
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  logoutArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  logoutMenu: {
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutMenuText: {
    fontSize: 16,
    color: '#c62828',
    fontWeight: '600',
  },
});
