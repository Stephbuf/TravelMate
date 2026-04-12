import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab3',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  showFriendModal = false;
  searchTerm: string = '';

  samplePins = [
    {
      name: 'Eiffel Tower',
      user: 'Alice',
      avatar: 'assets/avatars/avatar2.png',
      badge: '🏆 Top Contributor',
      description: 'Iconic landmark, perfect photo spot!',
      stars: [1, 2, 3, 4, 5],
      emoji: '😍',
      reviews: [
        { user: 'Bob', comment: 'Stunning views!' },
        { user: 'Charlie', comment: 'Crowded but magical.' }
      ],
      newReview: ''
    },
    {
      name: 'Shibuya Crossing',
      user: 'Kenji',
      avatar: 'assets/avatars/avatar3.png',
      badge: '🌟 Local Guide',
      description: 'Busy, but amazing Tokyo experience.',
      stars: [1, 2, 3, 4],
      emoji: '😎',
      reviews: [
        { user: 'Sam', comment: 'Feels like a movie scene!' }
      ],
      newReview: ''
    },
    {
      name: 'Colosseum',
      user: 'Giulia',
      avatar: 'assets/avatars/avatar4.png',
      badge: '🏛️ Historic Buff',
      description: 'A walk through Roman history!',
      stars: [1, 2, 3, 4, 5],
      emoji: '🤩',
      reviews: [
        { user: 'Marco', comment: 'Epic and timeless.' }
      ],
      newReview: ''
    }
  ];

  openFriendModal() {
    this.showFriendModal = true;
  }

  closeFriendModal() {
    this.showFriendModal = false;
  }

  filteredPins() {
    const term = this.searchTerm.toLowerCase();
    return this.samplePins.filter(pin =>
      pin.name.toLowerCase().includes(term) ||
      pin.description.toLowerCase().includes(term) ||
      pin.user.toLowerCase().includes(term) ||
      pin.reviews.some(review =>
        review.comment.toLowerCase().includes(term) || review.user.toLowerCase().includes(term)
      )
    );
  }

  addToMyList(pin: any) {
    console.log(`Added ${pin.name} to your list.`);

  }

  submitReview(pin: any, index: number) {
    const comment = pin.newReview?.trim();
    if (comment) {
      this.samplePins[index].reviews.push({ user: 'You', comment });
      this.samplePins[index].newReview = '';
      console.log(`Review added to ${pin.name}: "${comment}"`);
    }
  }

  addFriend() {
    console.log('Friend request sent.');

  }
}
