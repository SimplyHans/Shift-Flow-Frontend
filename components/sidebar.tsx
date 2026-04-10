import { Colors } from '@/constants/theme';
import { useSidebar } from '@/contexts/sidebar-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import api from '@/app/config/axios';

type NavItem = {
  label: string;
  href: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const SHIFTS_ITEMS: NavItem[] = [
  { label: 'My Schedule', href: '/(tabs)/myschedule', icon: 'calendar-today' },
  { label: 'Open Shifts', href: '/(tabs)/open-shifts', icon: 'work' },
  { label: 'Requests', href: '/(tabs)/requests', icon: 'mark-email-unread' },
];

const STORE_ITEMS: NavItem[] = [
  { label: 'Schedule', href: '/(tabs)/schedule', icon: 'calendar-today' },
  { label: 'Team', href: '/(tabs)/team', icon: 'people' },
  { label: 'Availability', href: '/(tabs)/availability', icon: 'event-available' },
];

export default function Sidebar() {
  const router = useRouter();
  const { isExpanded, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    role: string;
  } | null>(null);

  const isCompact = !isExpanded;
  const sidebarWidth = isCompact ? 64 : 240; // Reduced width

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me'); 
        setUser(res.data);
      } catch (err) {
        console.log('Sidebar user fetch error:', err);
      }
    };
    fetchUser();
  }, []);

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
          isActive && styles.navButtonActive,
          pressed && { opacity: 0.8 },
        ]}
      >
        <MaterialIcons
          name={item.icon}
          size={20}
          color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
        />
        {!isCompact && (
          <Text
            style={[
              styles.navLabel,
              { color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)' },
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
      <View style={[styles.sidebar, { width: sidebarWidth }]}>
        {/* Header - Text Logo Only */}
        <View style={[styles.header, isCompact && styles.headerCompact]}>
          {!isCompact && (
            <Text style={styles.brandName}>SHIFT FLOW</Text>
          )}
          <Pressable onPress={toggleSidebar} style={styles.toggleBtn}>
            <MaterialIcons 
              name={isCompact ? 'menu' : 'menu-open'} 
              size={22} 
              color="#FFFFFF" 
            />
          </Pressable>
        </View>

        {/* Navigation Container */}
        <View style={styles.navContainer}>
          <View style={styles.section}>
            {!isCompact && <Text style={styles.sectionLabel}>Operations</Text>}
            {SHIFTS_ITEMS.map(renderNavButton)}
          </View>

          <View style={styles.section}>
            {!isCompact && <Text style={styles.sectionLabel}>Management</Text>}
            {STORE_ITEMS.map(renderNavButton)}
          </View>
        </View>

        <View style={styles.spacer} />

        {/* Profile Card - Professional White-on-Blue */}
        <Pressable
          onPress={() => setShowLogoutMenu(true)}
          style={({ pressed }) => [
            styles.profileCard,
            pressed && { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user ? user.firstName[0] : '?'}
            </Text>
          </View>
          
          {!isCompact && (
            <View style={styles.profileDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </Text>
              <Text style={styles.userRole} numberOfLines={1}>
                {user ? user.role.toLowerCase() : 'Please wait'}
              </Text>
            </View>
          )}
          {!isCompact && <MaterialIcons name="more-vert" size={18} color="rgba(255, 255, 255, 0.6)" />}
        </Pressable>
      </View>

      {/* Floating Logout Menu */}
      <Modal visible={showLogoutMenu} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowLogoutMenu(false)}>
          <View style={[styles.floatingMenu, { left: isCompact ? 70 : 20 }]}>
            <Pressable onPress={handleLogout} style={styles.menuItem}>
              <MaterialIcons name="logout" size={18} color="#ef4444" />
              <Text style={styles.menuItemText}>Sign Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    backgroundColor: '#6579FF',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
    height: 30,
  },
  headerCompact: {
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  toggleBtn: {
    padding: 4,
  },
  navContainer: {
    flex: 1,
    zIndex: 10
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#6579FF',
    fontWeight: '800',
    fontSize: 14,
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userRole: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'capitalize',
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingMenu: {
    position: 'absolute',
    bottom: 80,
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
});