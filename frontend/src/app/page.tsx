'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  Star, 
  Clock,
  Search,
  ArrowRight,
  CheckCircle,
  Settings
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Catalogue Riche',
      description: 'Accédez à des milliers de livres académiques et littéraires'
    },
    {
      icon: Search,
      title: 'Recherche Avancée',
      description: 'Trouvez facilement vos livres par titre, auteur ou catégorie'
    },
    {
      icon: Clock,
      title: 'Gestion des Emprunts',
      description: 'Suivez vos emprunts et dates de retour en temps réel'
    },
    {
      icon: Star,
      title: 'Système de Notes',
      description: 'Consultez les avis et notez vos lectures'
    }
  ];

  const stats = [
    { label: 'Livres disponibles', value: '2,500+' },
    { label: 'Étudiants inscrits', value: '850+' },
    { label: 'Emprunts ce mois', value: '320+' },
    { label: 'Satisfaction', value: '98%' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Plateforme de Gestion de
              <span className="block text-primary-200">Bibliothèque 2IE</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Modernisez votre expérience de lecture avec notre plateforme intuitive. 
              Recherchez, réservez et empruntez vos livres en ligne.
            </p>
            
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/livres"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Explorer le Catalogue</span>
                </Link>
                <Link
                  href="/mes-emprunts"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors flex items-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Mes Emprunts</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span>S'inscrire Maintenant</span>
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Se Connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Welcome Section pour utilisateurs connectés */}
      {isAuthenticated && (
        <section className="py-12 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-primary-100 p-3 rounded-full">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    Bienvenue, {user?.prenom} !
                  </h2>
                  <p className="text-secondary-600">
                    {user?.role === 'admin' ? 'Panneau d\'administration' : 'Espace étudiant'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/livres"
                  className="p-6 border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <Search className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-secondary-900 mb-2">Rechercher des Livres</h3>
                  <p className="text-secondary-600 text-sm">Explorez notre catalogue complet</p>
                </Link>
                
                <Link
                  href="/mes-emprunts"
                  className="p-6 border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <BookOpen className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-secondary-900 mb-2">Mes Emprunts</h3>
                  <p className="text-secondary-600 text-sm">Gérez vos livres empruntés</p>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="p-6 border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all group"
                  >
                    <Settings className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-secondary-900 mb-2">Administration</h3>
                    <p className="text-secondary-600 text-sm">Gérer la bibliothèque</p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Fonctionnalités Modernes
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Une plateforme complète pour simplifier votre expérience de bibliothèque
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Notre Impact
            </h2>
            <p className="text-xl text-secondary-600">
              Des chiffres qui témoignent de notre engagement
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-secondary-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Rejoignez Notre Communauté
            </h2>
            <p className="text-xl text-primary-200 mb-8">
              Inscrivez-vous dès maintenant et découvrez une nouvelle façon de gérer vos lectures
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Inscription Gratuite</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
