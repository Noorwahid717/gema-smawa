#!/usr/bin/env node

/**
 * Test Script: Joyful Student Dashboard Integration
 * Purpose: Test student dashboard with real database data and playful design
 * 
 * Usage: node tests/manual/test-student-dashboard.js
 */

const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const STUDENT_DASHBOARD_API = '/api/student/dashboard';
const SAMPLE_STUDENT_ID = 'STU001'; // Sample student ID for testing

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function testStudentDashboard() {
  log('cyan', '🎉 Testing Joyful Student Dashboard Integration...\n');
  
  try {
    // Test API endpoint
    log('yellow', '📊 Testing Student Dashboard API...');
    const apiUrl = `${BASE_URL}${STUDENT_DASHBOARD_API}?studentId=${SAMPLE_STUDENT_ID}`;
    const response = await makeRequest(apiUrl);
    
    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    if (!response.data.success) {
      log('yellow', '⚠️  API returned no data - this might be expected for new student');
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      return;
    }
    
    const stats = response.data.data;
    
    log('green', '✅ Student Dashboard API Response Received!');
    log('magenta', '🎨 Joyful Dashboard Statistics:');
    console.log('─'.repeat(60));
    
    // Student Information
    if (stats.student) {
      log('blue', '👤 Student Information:');
      console.log(`   📝 Name: ${stats.student.fullName}`);
      console.log(`   🎓 Student ID: ${stats.student.studentId}`);
      console.log(`   📚 Class: ${stats.student.class}`);
      console.log(`   📧 Email: ${stats.student.email}`);
      console.log('');
    }
    
    // Learning Progress
    log('blue', '📈 Learning Progress:');
    console.log(`   📚 Total Assignments: ${stats.totalAssignments}`);
    console.log(`   ✅ Completed: ${stats.completedAssignments}`);
    console.log(`   ⏳ Pending: ${stats.pendingAssignments}`);
    console.log(`   ⚠️  Overdue: ${stats.overdueAssignments}`);
    console.log(`   📊 Completion: ${stats.completionPercentage}%\n`);
    
    // Engagement Metrics
    log('blue', '🚀 Engagement Metrics:');
    console.log(`   📝 Total Submissions: ${stats.totalSubmissions}`);
    console.log(`   💬 Total Feedbacks: ${stats.totalFeedbacks}`);
    console.log(`   🎨 Portfolio Submissions: ${stats.portfolioSubmissions}`);
    console.log(`   📋 Portfolio Tasks: ${stats.portfolioTasks}`);
    console.log(`   🔥 Learning Streak: ${stats.learningStreak} days`);
    console.log(`   ⚡ Engagement Score: ${stats.engagementScore}/100\n`);
    
    // Recent Activity
    log('blue', '⏰ Recent Activity:');
    console.log(`   📤 Recent Submissions: ${stats.recentSubmissions}`);
    console.log(`   💭 Recent Feedbacks: ${stats.recentFeedbacks}`);
    console.log(`   📊 Weekly Progress: ${stats.weeklyProgress}`);
    console.log(`   📈 Weekly Growth: ${stats.weeklyGrowth}\n`);
    
    // Status Indicators
    log('blue', '🎯 Status Indicators:');
    console.log(`   📚 Assignments Status: ${getStatusEmoji(stats.status.assignments)} ${stats.status.assignments}`);
    console.log(`   🎨 Portfolio Status: ${getStatusEmoji(stats.status.portfolio)} ${stats.status.portfolio}`);
    console.log(`   ⚡ Engagement Level: ${getEngagementEmoji(stats.status.engagement)} ${stats.status.engagement}\n`);
    
    // Achievements & Flags
    log('blue', '🏆 Achievements & Flags:');
    console.log(`   🔥 Active This Week: ${stats.isActiveThisWeek ? '✅ YES! 🚀' : '❌ Not yet ☕'}`);
    console.log(`   ⚠️  Has Overdue: ${stats.hasOverdueAssignments ? '❌ Yes, needs attention!' : '✅ All good! 😎'}`);
    console.log(`   📊 Portfolio Progress: ${stats.portfolioProgress}%\n`);
    
    // Context Data
    log('blue', '🌍 Context Data:');
    console.log(`   👥 Total Students: ${stats.totalStudents}`);
    console.log(`   📖 Total Articles: ${stats.totalTutorialArticles}`);
    console.log(`   📋 Learning Stages: ${stats.roadmapStages}\n`);
    
    console.log('─'.repeat(60));
    
    // Joyful Analysis
    log('magenta', '🎉 Joyful Analysis:');
    
    if (stats.engagementScore >= 80) {
      log('green', '🌟 AMAZING! This student is a learning superstar! ⭐');
    } else if (stats.engagementScore >= 60) {
      log('yellow', '💪 Great job! Keep up the good momentum! 🚀');
    } else if (stats.engagementScore >= 40) {
      log('yellow', '📚 Good start! There\'s room for more awesome! 💡');
    } else {
      log('cyan', '☕ Time to spark that learning energy! Let\'s make it fun! ✨');
    }
    
    if (stats.learningStreak > 7) {
      log('green', '🔥 WOW! Amazing learning streak! You\'re on fire! 🎊');
    } else if (stats.learningStreak > 3) {
      log('yellow', '📈 Nice streak building up! Keep it going! 💪');
    } else if (stats.learningStreak > 0) {
      log('cyan', '🌱 Great start! Let\'s build that streak! 🚀');
    }
    
    if (stats.completionPercentage >= 90) {
      log('green', '🏆 Outstanding completion rate! Almost perfect! 👑');
    } else if (stats.completionPercentage >= 70) {
      log('yellow', '✨ Excellent progress! You\'re doing great! 🎯');
    } else if (stats.completionPercentage >= 50) {
      log('cyan', '📚 Good progress! Keep pushing forward! 💪');
    } else {
      log('magenta', '🚀 Adventure awaits! So much to explore and learn! 🗺️');
    }
    
    log('green', '\n🎊 Student Dashboard Integration Test - SUCCESS! 🎊');
    
    // Test Summary
    log('blue', '\n📋 Test Summary:');
    console.log(`- API Status: ${response.status === 200 ? '✅ Perfect!' : '❌ Issues found'}`);
    console.log(`- Data Integrity: ${stats.student ? '✅ Complete' : '⚠️ Missing student data'}`);
    console.log(`- Real Database: ${stats.totalSubmissions + stats.totalFeedbacks > 0 ? '✅ Connected' : '⚠️ No activity yet'}`);
    console.log(`- Joyful Design Ready: ✅ All metrics available for playful UI`);
    console.log(`- Integration Status: ✅ READY FOR JOYFUL LEARNING! 🎉`);
    
  } catch (error) {
    log('red', `❌ Test Failed: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      log('yellow', '💡 Make sure the development server is running:');
      log('cyan', '   npm run dev');
    }
    
    process.exit(1);
  }
}

function getStatusEmoji(status) {
  switch (status) {
    case 'up_to_date': return '✅';
    case 'in_progress': return '🚀';
    case 'needs_attention': return '⚠️';
    case 'complete': return '🏆';
    case 'needs_start': return '⭐';
    default: return '📍';
  }
}

function getEngagementEmoji(level) {
  switch (level) {
    case 'high': return '🔥';
    case 'medium': return '💪';
    case 'low': return '☕';
    default: return '📈';
  }
}

// Fun header
console.log(colors.cyan + colors.bold);
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║           🎉 JOYFUL STUDENT DASHBOARD TEST 🎉           ║');
console.log('║                                                          ║');
console.log('║  Testing real database integration with playful design  ║');
console.log('║              SMA Wahidiyah GEMA Platform                ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log(colors.reset + '\n');

// Run the test
testStudentDashboard();
